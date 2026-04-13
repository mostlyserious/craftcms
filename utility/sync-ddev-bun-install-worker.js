import fs from 'node:fs'
import path from 'node:path'

const manifestFiles = ['package.json', 'bun.lock']

/**
 * Run the DDEV dependency sync after host package-manager changes settle.
 */
export async function runWorker({
    env = process.env,
    spawnSync = defaultSpawnSync,
    warn = defaultWarn,
    getSnapshot = defaultGetManifestSnapshot,
    sleep = defaultSleep,
    now = Date.now,
    cwd = process.cwd(),
    pollIntervalMs = 250,
    stablePollsRequired = 3,
    timeoutMs = 10000,
} = {}) {
    if (env.IS_DDEV_PROJECT === 'true') {
        return { status: 'skipped' }
    }

    const status = getDdevProjectStatus(spawnSync)

    if (!status.running) {
        warn(status.message)
        return { status: 'skipped' }
    }

    const stable = await waitForManifestStability({
        cwd,
        getSnapshot,
        sleep,
        now,
        pollIntervalMs,
        stablePollsRequired,
        timeoutMs,
    })

    if (!stable) {
        warn(
            'Skipping container dependency sync because `package.json` and `bun.lock` did not stabilize in time. Run `ddev bun install` when you want to refresh container dependencies.',
        )
        return { status: 'skipped' }
    }

    const mutagenResult = spawnSync(['ddev', 'mutagen', 'sync'], {
        stdin: 'ignore',
        stdout: 'inherit',
        stderr: 'inherit',
    })

    if (!mutagenResult.success) {
        warn(
            'Skipping container dependency sync because `ddev mutagen sync` failed. Run `ddev bun install` when you want to refresh container dependencies.',
        )
        return { status: 'skipped' }
    }

    const syncResult = syncContainerDependencies(spawnSync)

    if (!syncResult.success) {
        warn(
            'Skipping container dependency sync because the background DDEV install failed. Run `ddev bun install` when you want to refresh container dependencies.',
        )
        return { status: 'failed', exitCode: syncResult.exitCode ?? 1 }
    }

    return { status: 'synced' }
}

/**
 * Wait until the host dependency manifest pair stops changing.
 */
export async function waitForManifestStability({
    cwd = process.cwd(),
    getSnapshot = defaultGetManifestSnapshot,
    sleep = defaultSleep,
    now = Date.now,
    pollIntervalMs = 250,
    stablePollsRequired = 3,
    timeoutMs = 10000,
} = {}) {
    let previousSnapshot = null
    let stablePolls = 0
    const deadline = now() + timeoutMs

    while (now() <= deadline) {
        const snapshot = getSnapshot({ cwd })

        if (snapshot !== null && snapshotsEqual(previousSnapshot, snapshot)) {
            stablePolls += 1
        } else if (snapshot !== null) {
            stablePolls = 1
        } else {
            stablePolls = 0
        }

        if (stablePolls >= stablePollsRequired) {
            return true
        }

        previousSnapshot = snapshot
        await sleep(pollIntervalMs)
    }

    return false
}

/**
 * @returns {Record<string, { size: number, mtimeMs: number }> | null}
 */
export function defaultGetManifestSnapshot({ cwd = process.cwd() } = {}) {
    const snapshot = {}

    for (const file of manifestFiles) {
        const filePath = path.join(cwd, file)

        try {
            const stats = fs.statSync(filePath)

            snapshot[file] = {
                size: stats.size,
                mtimeMs: stats.mtimeMs,
            }
        } catch (error) {
            if (error?.code === 'ENOENT') {
                return null
            }

            throw error
        }
    }

    return snapshot
}

export function getDdevProjectStatus(spawnSync = defaultSpawnSync) {
    const result = spawnSync(['ddev', 'describe', '-j'], {
        stdin: 'ignore',
        stdout: 'pipe',
        stderr: 'pipe',
    })

    if (!result.success) {
        const stderr = result.stderr.toString()

        if (result.exitCode === 1 && stderr.includes('Executable not found in $PATH: "ddev"')) {
            return {
                running: false,
                message: 'Skipping container dependency sync because ddev is not installed on the host.',
            }
        }

        return {
            running: false,
            message:
                'Skipping container dependency sync because the DDEV web container is not running. Start DDEV and run `ddev bun install` when you want to refresh container dependencies.',
        }
    }

    const description = JSON.parse(result.stdout.toString())
    const projectStatus = description.raw?.status
    const webStatus = description.raw?.services?.web?.status

    if (projectStatus === 'running' && webStatus === 'running') {
        return {
            running: true,
            message: '',
        }
    }

    return {
        running: false,
        message:
            'Skipping container dependency sync because the DDEV web container is not running. Start DDEV and run `ddev bun install` when you want to refresh container dependencies.',
    }
}

/**
 * Remove container node_modules contents before reinstalling so stale packages
 * do not survive host-side Bun dependency changes.
 */
export function syncContainerDependencies(spawnSync = defaultSpawnSync) {
    const pruneResult = spawnSync(
        [
            'ddev',
            'exec',
            'find',
            '/var/www/html/node_modules',
            '-mindepth',
            '1',
            '-maxdepth',
            '1',
            '-exec',
            'rm',
            '-rf',
            '--',
            '{}',
            '+',
        ],
        {
            stdin: 'inherit',
            stdout: 'inherit',
            stderr: 'inherit',
        },
    )

    if (!pruneResult.success) {
        return pruneResult
    }

    return spawnSync(['ddev', 'bun', 'install', '--frozen-lockfile'], {
        stdin: 'inherit',
        stdout: 'inherit',
        stderr: 'inherit',
    })
}

/**
 * @param {string} message
 */
export function defaultWarn(message) {
    process.stderr.write(`[postinstall] ${message}\n`)
}

function snapshotsEqual(previousSnapshot, snapshot) {
    return previousSnapshot !== null && JSON.stringify(previousSnapshot) === JSON.stringify(snapshot)
}

function defaultSleep(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds)
    })
}

function defaultSpawnSync(args, options = {}) {
    const result = Bun.spawnSync(args, {
        cwd: options.cwd,
        env: options.env,
        stdin: options.stdin ?? 'pipe',
        stdout: 'pipe',
        stderr: 'pipe',
    })

    const stdout = toBuffer(result.stdout)
    const stderr = toBuffer(result.stderr)

    if (options.stdout === 'inherit' && stdout.length > 0) {
        process.stdout.write(stdout)
    }

    if (options.stderr === 'inherit' && stderr.length > 0) {
        process.stderr.write(stderr)
    }

    return {
        success: result.success,
        exitCode: result.exitCode ?? 1,
        stdout,
        stderr,
        error: result.error,
    }
}

function toBuffer(output) {
    if (Buffer.isBuffer(output)) {
        return output
    }

    if (typeof output === 'string') {
        return Buffer.from(output)
    }

    return Buffer.alloc(0)
}

if (import.meta.main) {
    await runWorker()
}
