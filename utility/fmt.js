import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCRIPT_CWD = process.cwd()
const BASE_CWD = process.env.INIT_CWD ? path.resolve(process.env.INIT_CWD) : SCRIPT_CWD
const SORTED_CLASS_CACHE = new Map()
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
let formatterRuntimePromise

/**
 * Format project files, using Oxfmt for regular files and conservative script/class formatting for Svelte files.
 */
async function main() {
    const { stdinFilepath, targets } = parseArguments(process.argv.slice(2))

    if (stdinFilepath) {
        process.stdout.write(await formatBufferedTarget(fs.readFileSync(0, 'utf8'), stdinFilepath))
        return
    }

    const resolvedTargets = targets.length ? targets : ['.']
    const { svelteFiles, vpTargets } = classifyTargets(resolvedTargets)

    if (vpTargets.length) {
        runLocalTool('vp', ['fmt', ...vpTargets], {
            stdio: 'inherit',
        })
    }

    for (const file of svelteFiles) {
        await formatSvelteScripts(file)
    }
}

/**
 * @param {string[]} args
 */
function parseArguments(args) {
    /** @type {string | undefined} */
    let stdinFilepath
    /** @type {string[]} */
    const targets = []

    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index]

        if (arg === '--stdin-filepath') {
            stdinFilepath = args[index + 1]

            if (!stdinFilepath) {
                throw new Error('Missing value for --stdin-filepath')
            }

            index += 1
            continue
        }

        targets.push(arg)
    }

    return {
        stdinFilepath,
        targets,
    }
}

/**
 * @param {string} source
 * @param {string} target
 */
function formatBufferedTarget(source, target) {
    if (target.toLowerCase().endsWith('.svelte')) {
        return formatSvelteSource(source)
    }

    return source
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
async function formatSvelteScripts(file) {
    const source = fs.readFileSync(file, 'utf8')
    const formatted = await formatSvelteSource(source)

    if (formatted !== source) {
        fs.writeFileSync(file, formatted)
    }
}

/**
 * @param {string} source
 */
async function formatSvelteSource(source) {
    const scriptFormatted = await formatSvelteScriptsInSource(source)
    return sortSvelteClasses(scriptFormatted)
}

/**
 * @param {string} source
 */
async function formatSvelteScriptsInSource(source) {
    const { parseSvelte } = await loadFormatterRuntime()
    const ast = parseSvelte(source)
    const blocks = [ast.module, ast.instance].filter(Boolean).sort((a, b) => b.content.start - a.content.start)
    let formatted = source

    for (const block of blocks) {
        const original = formatted.slice(block.content.start, block.content.end)
        const openingTag = formatted.slice(block.start, block.content.start)
        const extension = getScriptExtension(openingTag)
        const script = stripScriptPadding(original)
        const next = await formatScript(script, extension)

        if (next === script) {
            continue
        }

        formatted = `${formatted.slice(0, block.content.start)}${padScript(next, original)}${formatted.slice(block.content.end)}`
    }

    return formatted
}

/**
 * @param {string} source
 */
async function sortSvelteClasses(source) {
    const { parseSvelte } = await loadFormatterRuntime()
    const replacements = collectSvelteClassReplacements(parseSvelte(source).html)

    if (!replacements.length) {
        return source
    }

    const sortedValues = await sortClassAttributeValues(replacements.map(replacement => replacement.value))
    let formatted = source

    for (const replacement of replacements
        .map((entry, index) => {
            const value = sortedValues[index]

            return value && value !== entry.value ? { ...entry, value } : null
        })
        .filter(Boolean)
        .sort((a, b) => b.start - a.start)) {
        formatted = `${formatted.slice(0, replacement.start)}${replacement.value}${formatted.slice(replacement.end)}`
    }

    return formatted
}

/**
 * @param {unknown} node
 * @param {{ start: number; end: number; value: string }[]} replacements
 */
function collectSvelteClassReplacements(node, replacements = []) {
    if (!node || typeof node !== 'object') {
        return replacements
    }

    if (Array.isArray(node)) {
        for (const child of node) {
            collectSvelteClassReplacements(child, replacements)
        }

        return replacements
    }

    if (Array.isArray(node.attributes)) {
        for (const attribute of node.attributes) {
            const classValue = getStaticClassAttributeValue(attribute)

            if (!classValue) {
                continue
            }

            replacements.push(classValue)
        }
    }

    for (const value of Object.values(node)) {
        collectSvelteClassReplacements(value, replacements)
    }

    return replacements
}

/**
 * @param {unknown} attribute
 */
function getStaticClassAttributeValue(attribute) {
    const classValue = getStaticAttributeText(attribute, 'class')

    if (!classValue || /[{}]/.test(classValue)) {
        return null
    }

    const [value] = attribute.value

    return {
        start: value.start,
        end: value.end,
        value: classValue,
    }
}

/**
 * @param {unknown} attribute
 * @param {string} name
 */
function getStaticAttributeText(attribute, name) {
    if (!attribute || typeof attribute !== 'object' || attribute.type !== 'Attribute' || attribute.name !== name) {
        return null
    }

    if (!Array.isArray(attribute.value) || attribute.value.length !== 1) {
        return null
    }

    const [value] = attribute.value

    if (!value || typeof value !== 'object' || value.type !== 'Text') {
        return null
    }

    return value.data ?? value.raw ?? ''
}

/**
 * @param {string[]} classValues
 */
async function sortClassAttributeValues(classValues) {
    const resolvedValues = new Map()
    const uncachedValues = []

    for (const classValue of classValues) {
        if (!classValue.trim()) {
            resolvedValues.set(classValue, classValue)
            continue
        }

        if (SORTED_CLASS_CACHE.has(classValue)) {
            resolvedValues.set(classValue, SORTED_CLASS_CACHE.get(classValue))
            continue
        }

        if (!resolvedValues.has(classValue)) {
            uncachedValues.push(classValue)
        }
    }

    if (uncachedValues.length) {
        const sortedValues = await batchSortClassAttributeValues(uncachedValues)

        for (const [index, classValue] of uncachedValues.entries()) {
            const sortedValue = sortedValues[index] ?? classValue

            SORTED_CLASS_CACHE.set(classValue, sortedValue)
            resolvedValues.set(classValue, sortedValue)
        }
    }

    return classValues.map(classValue => resolvedValues.get(classValue) ?? classValue)
}

/**
 * @param {string[]} classValues
 */
async function batchSortClassAttributeValues(classValues) {
    const { parseSvelte } = await loadFormatterRuntime()
    const source = classValues
        .map((classValue, index) => `<div data-fmt-index="${index}" class="${escapeHtmlAttribute(classValue)}"></div>`)
        .join('\n')
    const formatted = await formatHtmlSnippet(source)

    if (formatted === source) {
        return classValues
    }

    const sortedValues = [...classValues]

    for (const child of parseSvelte(formatted).html.children) {
        if (!child || typeof child !== 'object' || child.type !== 'Element' || !Array.isArray(child.attributes)) {
            continue
        }

        let index = Number.NaN
        let classValue = null

        for (const attribute of child.attributes) {
            const indexValue = getStaticAttributeText(attribute, 'data-fmt-index')

            if (indexValue !== null) {
                index = Number.parseInt(indexValue, 10)
                continue
            }

            const nextClassValue = getStaticAttributeText(attribute, 'class')

            if (nextClassValue !== null) {
                classValue = nextClassValue
            }
        }

        if (Number.isNaN(index) || classValue === null) {
            continue
        }

        sortedValues[index] = classValue
    }

    return sortedValues
}

/**
 * @param {string} value
 */
function escapeHtmlAttribute(value) {
    return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll("'", '&#39;').replaceAll('<', '&lt;')
}

/**
 * @param {string} source
 */
async function formatHtmlSnippet(source) {
    const { formatWithOxfmt, oxfmtConfig } = await loadFormatterRuntime()

    try {
        return (await formatWithOxfmt('component-markup.html', source, oxfmtConfig)).code.trim()
    } catch {
        return source
    }
}

/**
 * @param {string} tool
 * @param {string[]} args
 * @param {{ stdio?: 'inherit' }=} options
 */
function runLocalTool(tool, args, options = {}) {
    const result = Bun.spawnSync([path.join(PROJECT_ROOT, 'node_modules', '.bin', tool), ...args], {
        cwd: SCRIPT_CWD,
        stdin: options.stdio === 'inherit' ? 'inherit' : 'pipe',
        stdout: options.stdio === 'inherit' ? 'inherit' : 'pipe',
        stderr: options.stdio === 'inherit' ? 'inherit' : 'pipe',
    })

    if (!result.success) {
        process.exit(result.exitCode ?? 1)
    }
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
async function formatScript(source, extension) {
    if (!source.trim()) {
        return source
    }

    const { formatWithOxfmt, oxfmtConfig } = await loadFormatterRuntime()
    return (await formatWithOxfmt(`component-script.${extension}`, source, oxfmtConfig)).code.replace(/\n$/, '')
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

function loadFormatterRuntime() {
    if (!formatterRuntimePromise) {
        formatterRuntimePromise = Promise.all([
            import('oxfmt'),
            import('svelte/compiler'),
            import('../oxfmt.config.ts'),
        ]).then(([oxfmt, svelteCompiler, config]) => ({
            formatWithOxfmt: oxfmt.format,
            parseSvelte: svelteCompiler.parse,
            oxfmtConfig: config.default,
        }))
    }

    return formatterRuntimePromise
}

await main()
