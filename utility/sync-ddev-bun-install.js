/**
 * Sync container-side dependencies after a host Bun package-manager command.
 */
function main() {
    if (Bun.env.IS_DDEV_PROJECT === 'true') {
        return
    }

    const status = getDdevProjectStatus()

    if (!status.running) {
        warn(status.message)
        return
    }

    const result = Bun.spawnSync(['ddev', 'bun', 'install'], {
        stdin: 'inherit',
        stdout: 'inherit',
        stderr: 'inherit',
    })

    if (!result.success) {
        process.exit(result.exitCode)
    }
}

/**
 * @returns {{ running: boolean, message: string }}
 */
function getDdevProjectStatus() {
    const result = Bun.spawnSync(['ddev', 'describe', '-j'], {
        stdin: 'ignore',
        stdout: 'pipe',
        stderr: 'pipe',
    })

    if (!result.success) {
        const stderr = result.stderr.toString()

        if (result.exitCode === 1 && stderr.includes('Executable not found in $PATH: "ddev"')) {
            return {
                running: false,
                message: 'Skipping container Bun sync because ddev is not installed on the host.',
            }
        }

        return {
            running: false,
            message:
                'Skipping container Bun sync because the DDEV web container is not running. Start DDEV and run `ddev bun install` when you want to refresh container dependencies.',
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
            'Skipping container Bun sync because the DDEV web container is not running. Start DDEV and run `ddev bun install` when you want to refresh container dependencies.',
    }
}

/**
 * @param {string} message
 */
function warn(message) {
    process.stderr.write(`[postinstall] ${message}\n`)
}

main()
