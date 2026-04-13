import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'svelte/compiler'

const SCRIPT_CWD = process.cwd()
const BASE_CWD = process.env.INIT_CWD ? path.resolve(process.env.INIT_CWD) : SCRIPT_CWD
const ESLINT_BATCH_SIZE = 50
const SKIP_DIRECTORIES = new Set([
    '.ddev',
    '.git',
    '.idea',
    '.zed',
    '.vscode',
    'config',
    'node_modules',
    'storage',
    'vendor',
    'web',
])

/**
 * Format project files, using Oxfmt for regular files, script-only formatting for Svelte files,
 * and ESLint fixes for Svelte components.
 */
function main() {
    const targets = process.argv.slice(2)
    const resolvedTargets = targets.length ? targets : ['.']
    const { svelteFiles, vpTargets } = classifyTargets(resolvedTargets)

    if (vpTargets.length) {
        runBunTool('vp', ['fmt', ...vpTargets], {
            stdio: 'inherit',
        })
    }

    for (const file of svelteFiles) {
        formatSvelteScripts(file)
    }

    runEslintFixes(svelteFiles)
}

/**
 * @param {string[]} targets
 */
function classifyTargets(targets) {
    const svelteFiles = new Set()
    const vpTargets = []

    for (const target of targets) {
        const resolved = resolveTarget(target)

        if (!fs.existsSync(resolved)) {
            vpTargets.push(target)
            continue
        }

        const stat = fs.statSync(resolved)

        if (stat.isDirectory()) {
            vpTargets.push(normalizeTarget(resolved))

            for (const file of findSvelteFiles(resolved)) {
                svelteFiles.add(file)
            }

            continue
        }

        if (resolved.endsWith('.svelte')) {
            svelteFiles.add(resolved)
            continue
        }

        vpTargets.push(normalizeTarget(resolved))
    }

    return {
        svelteFiles: [...svelteFiles],
        vpTargets,
    }
}

/**
 * @param {string} target
 */
function resolveTarget(target) {
    if (path.isAbsolute(target)) {
        return target
    }

    return path.resolve(BASE_CWD, target)
}

/**
 * @param {string} target
 */
function normalizeTarget(target) {
    return path.relative(SCRIPT_CWD, target) || '.'
}

/**
 * @param {string} directory
 * @returns {string[]}
 */
function findSvelteFiles(directory) {
    /** @type {string[]} */
    const files = []

    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const resolved = path.join(directory, entry.name)

        if (entry.isDirectory()) {
            if (SKIP_DIRECTORIES.has(entry.name)) {
                continue
            }

            files.push(...findSvelteFiles(resolved))
            continue
        }

        if (entry.isFile() && resolved.endsWith('.svelte')) {
            files.push(resolved)
        }
    }

    return files
}

/**
 * @param {string} file
 */
function formatSvelteScripts(file) {
    const source = fs.readFileSync(file, 'utf8')
    const ast = parse(source)
    const blocks = [ast.module, ast.instance].filter(Boolean).sort((a, b) => b.content.start - a.content.start)
    let formatted = source

    for (const block of blocks) {
        const original = formatted.slice(block.content.start, block.content.end)
        const openingTag = formatted.slice(block.start, block.content.start)
        const extension = getScriptExtension(openingTag)
        const script = stripScriptPadding(original)
        const next = formatScript(script, extension)

        if (next === script) {
            continue
        }

        formatted = `${formatted.slice(0, block.content.start)}${padScript(next, original)}${formatted.slice(block.content.end)}`
    }

    if (formatted !== source) {
        fs.writeFileSync(file, formatted)
    }
}

/**
 * @param {string[]} files
 */
function runEslintFixes(files) {
    if (!files.length) {
        return
    }

    for (let index = 0; index < files.length; index += ESLINT_BATCH_SIZE) {
        runBunTool('eslint', ['--fix', ...files.slice(index, index + ESLINT_BATCH_SIZE)], {
            stdio: 'inherit',
        })
    }
}

/**
 * @param {string} tool
 * @param {string[]} args
 * @param {import('node:child_process').ExecFileSyncOptions=} options
 */
function runBunTool(tool, args, options = {}) {
    return execFileSync('bun', ['x', '--bun', tool, ...args], {
        cwd: SCRIPT_CWD,
        ...options,
    })
}

/**
 * @param {string} source
 */
function stripScriptPadding(source) {
    return source.replace(/^\n/, '').replace(/\n[ \t]*$/, '')
}

/**
 * @param {string} source
 * @param {'js'|'ts'} extension
 */
function formatScript(source, extension) {
    if (!source.trim()) {
        return source
    }

    return runBunTool('oxfmt', ['--stdin-filepath', `component-script.${extension}`], {
        encoding: 'utf8',
        input: source,
    }).replace(/\n$/, '')
}

/**
 * @param {string} source
 * @param {string} original
 */
function padScript(source, original) {
    const indent = detectIndent(original)
    const lines = source.split('\n').map(line => (line ? `${indent}${line}` : ''))

    return `\n${lines.join('\n')}\n`
}

/**
 * @param {string} source
 */
function detectIndent(source) {
    for (const line of source.split('\n')) {
        if (!line.trim()) {
            continue
        }

        return line.match(/^\s*/)?.[0] ?? ''
    }

    return '    '
}

/**
 * @param {string} openingTag
 * @returns {'js'|'ts'}
 */
function getScriptExtension(openingTag) {
    const lang = openingTag.match(/\blang\s*=\s*(?:"([^"]+)"|'([^']+)')/i)
    const value = lang?.[1] ?? lang?.[2] ?? ''

    return value.toLowerCase().startsWith('ts') ? 'ts' : 'js'
}

main()
