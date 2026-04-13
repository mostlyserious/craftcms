import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defaultWarn, getDdevProjectStatus } from './sync-ddev-bun-install-worker.js'

const workerScript = fileURLToPath(new URL('./sync-ddev-bun-install-worker.js', import.meta.url))
const workerLog = path.join(os.tmpdir(), 'craftcms-ddev-dependency-sync.log')
const workerRuntime = process.execPath

/**
 * Schedule a best-effort DDEV dependency sync after the host Bun command finishes.
 */
export function main({
    env = Bun.env,
    spawnSync = Bun.spawnSync,
    warn = defaultWarn,
    spawnWorker = defaultSpawnWorker,
} = {}) {
    if (env.IS_DDEV_PROJECT === 'true') {
        return
    }

    const status = getDdevProjectStatus(spawnSync)

    if (!status.running) {
        warn(status.message)
        return
    }

    try {
        spawnWorker({ env })
    } catch {
        warn(
            'Skipping container dependency sync because the background worker could not be started. Run `ddev bun install` when you want to refresh container dependencies.',
        )
    }
}

/**
 * Spawn the background worker in a detached Bun process so host package-manager
 * commands can finish before the DDEV sync begins.
 */
export function defaultSpawnWorker({ env = Bun.env } = {}) {
    const result = Bun.spawnSync(
        [
            '/bin/sh',
            '-lc',
            `nohup ${shellQuote(workerRuntime)} ${shellQuote(workerScript)} >>${shellQuote(workerLog)} 2>&1 &`,
        ],
        {
            cwd: process.cwd(),
            env: { ...process.env, ...env },
            stdin: 'ignore',
            stdout: 'ignore',
            stderr: 'ignore',
        },
    )

    if (!result.success) {
        throw result.error ?? new Error(`Worker launcher exited with status ${result.exitCode}`)
    }

    return result
}

function shellQuote(value) {
    return `'${value.replaceAll("'", "'\\''")}'`
}

if (import.meta.main) {
    main()
}
