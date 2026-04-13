# Mostly Serious Craft CMS

## Documentation

- [Configuration Directory](config/README.md) - Craft CMS settings, plugin configurations, and project structure
- [Modules Directory](modules/README.md) - Custom Craft CMS modules, services, and backend functionality
- [Source Directory](src/README.md) - Frontend architecture, components, and development patterns
- [Utility Scripts and Modules](utility/README.md) - Environment configuration, setup scripts, and asset optimization plugins

## Installation

```sh
composer create-project --no-install mostlyserious/craftcms $PROJECT_NAME
```

## JavaScript Tooling

This template uses a host-first dual-install model for JavaScript tooling:

- `package.json` and `bun.lock` are the shared dependency definition
- `bun install` on the host is supported for IDE integrations and optional local JavaScript commands
- `ddev bun install` is supported for container runtime workflows

The host and container each keep their own `node_modules` tree. That is expected. They are two platform-specific installs of the same dependency manifest, not a single shared artifact.

This template keeps those installs separate by:

- checking in a DDEV Mutagen override that excludes `/node_modules` from sync
- mounting container-side `node_modules` on a dedicated Docker volume for the DDEV web container

If you pull changes that affect `.ddev/mutagen/mutagen.yml`, run `ddev mutagen reset` before continuing.

Use DDEV as the source of truth for app/runtime behavior:

- `ddev craft ...`
- `ddev vp build`
- `ddev vp dev`
- `ddev vp run fmt` for repo formatting, including Svelte script tags
- `ddev vp check` for Vite+ format and lint checks
- `ddev vp run check` for full frontend validation, including TypeScript and Svelte diagnostics
- `ddev vp fmt` for Oxfmt-only formatting
- `ddev vp exec oxfmt --version`

`ddev vp install` is available for container-side dependency installation, but it does not replace `bun|vp install` on the host for IDE tooling. Host and container installs remain separate by design.

Use host tooling for editor integrations and optional local JavaScript commands:

- `bun|vp install`
- host-resolved formatter, linter, and language-server binaries from `node_modules`
- optional local checks such as `bunx oxfmt --version`, `bunx oxlint --version`, and `bunx --bun vite --version`

This template also commits shared workspace settings for Zed and VS Code. VS Code users should install the recommended extensions when prompted. Host `bun|vp install` is still required for local editor tooling resolution.

This template does not require devcontainers, remote development features, or shared host/container `node_modules` to be productive in Zed, VS Code, or other IDEs.

## Configuration Files

This project includes several configuration files that define code quality standards, build processes, and development tooling:

### Code Quality & Linting

- **`.editorconfig`** - Editor configuration for consistent code formatting across different editors and IDEs. Defines indentation, line endings, and character encoding standards.

- **`oxlint.config.ts`** - Oxlint configuration for JavaScript, TypeScript, and Svelte files. Defines lint rules, plugins, and file-specific overrides for the frontend codebase.

- **`oxfmt.config.ts`** - Oxfmt configuration for repository-wide formatting. Acts as the shared formatter source for CLI usage and editor integration.

- **`pint.json`** - Laravel Pint configuration for PHP code formatting. Uses Laravel preset with additional rules for strict typing, ordered imports, and consistent code structure.

- **`stylelint.config.js`** - Stylelint configuration extending Hudochenkov's property order rules for CSS consistency.

### Build & Development

- **`vite.config.js`** - Vite build configuration that handles:
    - Asset bundling and optimization
    - Development server setup with hot module replacement
    - Integration with Tailwind CSS, Svelte, and custom plugins
    - Path aliases for easier imports
    - Production build optimization with code splitting

- **`tsconfig.json`** - TypeScript configuration defining:
    - Compilation targets and module resolution
    - Path mappings for project aliases (`$lib`, `$css`, `$img`, etc.)
    - Strict type checking rules
    - Include/exclude patterns for source files

- **`package.json`** - Node.js package configuration containing:
    - Development and production dependencies
    - Build scripts (`dev`, `build`)
    - Project metadata and type module declaration

### Development Workflow

These configuration files work together to provide:

- Consistent code formatting and style enforcement
- Modern JavaScript/TypeScript development with Svelte support
- Optimized asset bundling and processing
- Hot module replacement for rapid development
- Production-ready builds with code splitting and optimization
