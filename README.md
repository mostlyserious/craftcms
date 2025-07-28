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

## Configuration Files

This project includes several configuration files that define code quality standards, build processes, and development tooling:

### Code Quality & Linting

- **`.editorconfig`** - Editor configuration for consistent code formatting across different editors and IDEs. Defines indentation, line endings, and character encoding standards.

- **`eslint.config.js`** - ESLint configuration for JavaScript, TypeScript, and Svelte files. Enforces code style, catches potential errors, and maintains consistency across the frontend codebase.

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
