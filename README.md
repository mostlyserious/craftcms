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

This template uses DDEV as the source of truth for JavaScript tooling:

- `.ddev/config.yaml` installs Node 24 and enables Corepack
- `package.json` pins `pnpm@11.1.2` through the `packageManager` field
- `pnpm-lock.yaml` is the shared dependency lockfile
- `pnpm-workspace.yaml` installs native development-tool binaries for the current platform plus Darwin/Linux ARM64, so DDEV scripts and host IDE tooling can use the same dependency tree
- run pnpm package-manager commands through DDEV with `ddev pnpm ...`
- run `package.json` scripts through DDEV with `ddev pnpm run ...`

DDEV keeps `node_modules` out of Mutagen and bind-mounts it into the container. Run dependency installs through `ddev pnpm ...`; host editor tooling can reuse that install because `supportedArchitectures` keeps the required host and Linux native binaries available.

If you pull changes that affect `.ddev/config.yaml` or `.ddev/mutagen/mutagen.yml`, run `ddev mutagen reset` before continuing.

Use DDEV as the source of truth for app/runtime behavior:

- `ddev craft ...`
- `ddev pnpm install --frozen-lockfile` to install JavaScript dependencies
- `ddev pnpm add ...` and `ddev pnpm remove ...` for dependency changes
- `ddev pnpm run build` to build assets inside DDEV
- `ddev pnpm run dev` to start Vite inside DDEV
- `ddev pnpm run fmt` for repo formatting, including Svelte files, inside DDEV
- `ddev pnpm run check` for full frontend validation, including TypeScript and Svelte diagnostics, inside DDEV
- `ddev pnpm exec oxfmt --version`

Use host tooling only for editor integrations and optional local JavaScript commands:

- `corepack pnpm install` only if your editor needs a host-side dependency refresh
- host-resolved formatter, linter, and language-server binaries from `node_modules`
- optional local checks such as `corepack pnpm exec oxfmt --version` and `corepack pnpm exec oxlint --version`

This template also commits shared workspace settings for Zed and VS Code. VS Code users should install the recommended extensions when prompted. Host `corepack pnpm install` is only required when local editor tooling needs host dependency resolution.

This template does not require devcontainers, remote development features, dependency sync scripts, or a custom `node_modules` Docker volume to be productive in Zed, VS Code, or other IDEs.

## Configuration Files

This project includes several configuration files that define code quality standards, build processes, and development tooling:

### Code Quality & Linting

- **`.editorconfig`** - Editor configuration for consistent code formatting across different editors and IDEs. Defines indentation, line endings, and character encoding standards.

- **`oxlint.config.ts`** - Oxlint configuration for JavaScript, TypeScript, and Svelte script-block linting. Defines lint rules, plugins, and file-specific overrides for the frontend codebase.

- **`oxfmt.config.ts`** - Oxfmt configuration for repository-wide formatting, including Svelte file formatting. Acts as the shared formatter source for CLI usage and editor integration.

- **`pint.json`** - Laravel Pint configuration for PHP code formatting. Uses Laravel preset with additional rules for strict typing, ordered imports, and consistent code structure.

- **`stylelint.config.ts`** - Stylelint configuration extending Hudochenkov's property order rules for CSS consistency.

### Build & Development

- **`vite.config.ts`** - Vite build configuration that handles:
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
