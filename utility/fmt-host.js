import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const DDEV_CONFIG = path.join(REPO_ROOT, '.ddev', 'config.yaml')
const CONTAINER_APP_ROOT = '/var/www/html'
const CONTAINER_SCRIPT = `${CONTAINER_APP_ROOT}/utility/fmt.js`

/**
 * Run the formatter from the host with a direct container fast path.
 */
async function main({
    args = process.argv.slice(2),
    cwd = process.cwd(),
    env = process.env,
    stdinIsTTY = process.stdin.isTTY,
} = {}) {
    if (env.IS_DDEV_PROJECT === 'true') {
        return runCommand('bun', [CONTAINER_SCRIPT, ...args], {
            cwd,
            env,
        })
    }

    const containerCwd = mapHostPathToContainer(cwd)

    if (!containerCwd) {
        return runFallback(args, { cwd, env })
    }

    const containerName = await getWebContainerName()

    const dockerArgs = ['exec']

    if (!stdinIsTTY) {
        dockerArgs.push('-i')
    }

    dockerArgs.push(
        '-w',
        CONTAINER_APP_ROOT,
        '-e',
        `INIT_CWD=${containerCwd}`,
        containerName,
        'bun',
        CONTAINER_SCRIPT,
        ...args,
    )

    const result = runCommand('docker', dockerArgs, {
        cwd,
        env,
        stdin: 'inherit',
        stdout: 'pipe',
        stderr: 'pipe',
    })

    if (shouldFallback(result)) {
        return runFallback(args, { cwd, env })
    }

    writeCapturedOutput(result)
    return result
}

/**
 * @param {string[]} args
 * @param {{ cwd: string; env: NodeJS.ProcessEnv }} options
 */
function runFallback(args, { cwd, env }) {
    return runCommand('ddev', ['bun', 'utility/fmt.js', ...args], {
        cwd,
        env,
    })
}

/**
 * @param {string} command
 * @param {string[]} args
 * @param {{ cwd: string; env: NodeJS.ProcessEnv; stdin?: 'inherit'|'ignore'|'pipe'; stdout?: 'inherit'|'pipe'; stderr?: 'inherit'|'pipe' }} options
 */
function runCommand(command, args, { cwd, env, stdin = 'inherit', stdout = 'inherit', stderr = 'inherit' }) {
    const result = Bun.spawnSync([command, ...args], {
        cwd,
        env,
        stdin,
        stdout,
        stderr,
    })

    return {
        error: result.error,
        status: result.exitCode ?? 1,
        stdout: toBuffer(result.stdout),
        stderr: toBuffer(result.stderr),
    }
}

async function getWebContainerName() {
    return `ddev-${await getDdevProjectName()}-web`
}

async function getDdevProjectName() {
    const config = await Bun.file(DDEV_CONFIG)
        .text()
        .catch(() => '')

    for (const rawLine of config.split('\n')) {
        const line = rawLine.trimEnd()

        if (!line.trim() || line.trimStart().startsWith('#') || /^\s/.test(line)) {
            continue
        }

        const match = line.match(/^name:\s*(.+)$/)

        if (!match) {
            continue
        }

        const value = match[1].replace(/\s+#.*$/, '').trim()

        if (!value) {
            break
        }

        return value.replace(/^['"]|['"]$/g, '')
    }

    return path.basename(REPO_ROOT)
}

/**
 * @param {string} hostPath
 */
function mapHostPathToContainer(hostPath) {
    const relative = path.relative(REPO_ROOT, hostPath)

    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        return null
    }

    if (!relative) {
        return CONTAINER_APP_ROOT
    }

    return `${CONTAINER_APP_ROOT}/${relative.split(path.sep).join('/')}`
}

/**
 * Fall back only when Docker failed before the formatter could run.
 * @param {{ error?: Error; status: number; stderr?: Buffer }} result
 */
function shouldFallback(result) {
    if (result.error || result.status === 125) {
        return true
    }

    const stderr = result.stderr?.toString() ?? ''

    return (
        stderr.includes('No such container:') ||
        stderr.includes('container is not running') ||
        stderr.includes('is not running')
    )
}

/**
 * @param {{ stdout?: Buffer; stderr?: Buffer }} result
 */
function writeCapturedOutput(result) {
    if (result.stdout?.length) {
        process.stdout.write(result.stdout)
    }

    if (result.stderr?.length) {
        process.stderr.write(result.stderr)
    }
}

function toBuffer(output) {
    if (Buffer.isBuffer(output)) {
        return output
    }

    if (typeof output === 'string') {
        return Buffer.from(output)
    }

    if (output instanceof Uint8Array) {
        return Buffer.from(output)
    }

    return Buffer.alloc(0)
}

const result = await main()

process.exit(result.status)
