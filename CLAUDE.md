# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## AI Agent Ground Rules

**CRITICAL**: All AI agents working with this project must follow these mandatory rules:

### 1. DDEV Container Requirement
**ALL** development tools except formatting and linting must be executed through DDEV containers. Never run commands directly on the host system.

**Required Pattern:**
- `ddev craft up` (NOT `./craft up`)
- `ddev bun run build` (NOT `bun run build`)
- `ddev composer install` (NOT `composer install`)
- `ddev php` for any PHP execution

### 2. Database Access Prohibition
**NEVER** access the database directly. All database operations must go through:
- Craft CMS APIs and services
- The `ddev craft` CLI tool
- Proper Craft modules and controllers

**Forbidden:**
- Direct SQL queries
- Raw database connections
- Bypassing Craft's data layer

### 3. Aggressive Code Quality Enforcement
**ALWAYS** apply existing formatting and linting tools before completing any task:

**External Formatting Tools (Preferred - Use When Available):**
These tools use stdin/stdout and should be preferred over standard commands:
- `std-pint` - PHP formatting (replaces `pint`)
- `std-stylelint` - CSS/HTML formatting (replaces `stylelint --fix`)
- `std-rustywind` - Tailwind CSS class sorting for all file types

**Usage Examples:**
```bash
cat path/to/file.php | std-pint > path/to/file.php
cat path/to/file.html | std-rustywind > path/to/file.html
cat path/to/file.js | std-rustywind js > path/to/file.js
cat path/to/file.css | std-rustywind css > path/to/file.css
cat path/to/file.svelte | std-rustywind svelte > path/to/file.svelte
cat path/to/file.css | std-stylelint > path/to/file.css
```

**Installation:** If any `std-` commands are missing, install with:
```bash
bun add @mostlyserious/formatters --global
```

**Standard Commands (Fallback):**
- Run `pint` for PHP formatting (available globally)
- Run `eslint --fix` for JavaScript/TypeScript formatting (available globally)
- Run `stylelint --fix` for CSS formatting (available globally)
- Run `tsc --noEmit` to ensure TypeScript compilation passes without errors

**File Type Formatting Chains:**
- **HTML**: `std-stylelint html` → `std-rustywind`
- **Twig**: `std-rustywind`
- **CSS**: `std-rustywind css` → `std-stylelint`
- **PHP**: `std-pint` → `std-rustywind`
- **TypeScript/JavaScript**: `std-rustywind js`
- **Svelte**: `std-stylelint html` → `std-rustywind svelte`

**No exceptions** - code quality tools must pass before considering work complete.

### 4. Strict Adherence to Established Patterns

**Naming Conventions:**
- **Files & Folders**: kebab-case (`focus-trap.js`, `view-transition.js`)
- **Modules/Functions**: camelCase (`sveltify.js`, `lockScroll`, `trapFocus`)
- **Components**: PascalCase (`Image.svelte`, `Video.svelte`, `Icon.svelte`)
- **Twig Templates**: camelCase with underscore prefix (`_base.twig`, `_quickEdit.twig`)
- **PHP Variables**: snake_case (`strict_types`, `declare_strict_types`)
- **PHP Class Methods**: camelCase (`init()`, `getSerializer()`, `registerTwigExtension()`)
- **JavaScript Variables**: camelCase (`hasFocalPoint`, `focalPoint`)

**Code Formatting Standards:**
- **JavaScript/TypeScript**: 4-space indentation, single quotes, no semicolons, array bracket spacing `[ 1, 2, 3 ]`, object curly spacing `{ key: value }`, trailing commas in multiline
- **PHP**: Laravel preset with strict types declaration required, global namespace imports, ordered class elements, one space around concatenation `$a . $b`

**Schema Validation:**
- ALL data from external sources MUST be validated using Zod schemas
- Add schemas to `src/lib/schemas.js` for any new data structures
- External sources include: APIs, user input, file contents, database results

**Documentation Standards:**
- ALL functions and modules MUST include JSDoc comments
- Follow existing JSDoc patterns in the codebase
- Document parameters, return types, and usage examples

**Code Patterns:**
- Follow the module federation system for new features
- Use established path aliases (`$lib`, `$css`, `$img`, `$fontawesome`)
- Maintain the dual-context architecture (app.js vs dashboard.js)
- Follow existing TypeScript patterns and type definitions

## Project Overview

This is a Craft CMS starter project with a modern frontend architecture built on Vite, Svelte, TypeScript, and Tailwind CSS. The project uses a dual-context system to support both public-facing features and administrative dashboard integration.

### Core Technology Stack
- **Bun** as package manager (NOT npm/yarn)
- **Vite 7** for build tooling
- **Svelte 5** with runes enabled
- **TypeScript 5** with strict mode
- **Tailwind CSS 4**
- **Craft CMS 5**
- **PHP 8.3+** with strict types declaration
- **DDEV** for containerized development
- **ESLint 9** with flat config format
- **Zod 4 mini** for runtime schema validation

## Development Commands

### Build and Development
- `ddev bun run dev` - Start Vite development server with hot module replacement
- `ddev bun run build` - Build assets for production
- `ddev craft` - Craft CMS CLI tool for database operations, queue management, and administrative tasks
- `./utility/install.sh` - Automated project setup script (run once after project creation)

### Code Quality
- **PHP**: Uses Laravel Pint for code formatting (configured in `pint.json`)
- **JavaScript/TypeScript**: ESLint configured in `eslint.config.js`
- **CSS**: Stylelint configured in `stylelint.config.js`

### Testing
No specific test commands are configured in package.json. Check with the project maintainer for testing procedures.

## Architecture Overview

### Frontend Architecture
The project uses a **modular, schema-driven architecture** with these key patterns:

1. **Dual Entry Points**:
   - `src/app.js` - Public-facing features
   - `src/dashboard.js` - Craft CMS dashboard integration

2. **Module Federation System** (`src/lib/init.js`):
   - Selector-based automatic module loading
   - Lazy loading based on DOM data attributes
   - Feature modules in `src/lib/modules/` (animate, lightbox, toggle, etc.)

3. **Schema-Driven Development**:
   - Extensive use of Zod for validation (`src/lib/schemas.js`)
   - Runtime type safety and API contract enforcement
   - TypeScript integration through schema inference

4. **Component System**:
   - Svelte components with schema validation
   - CSS component architecture in `src/css/components/`
   - Reusable utilities in `src/lib/util/`

### Backend Integration
- **Craft CMS 5.8.8** with extensive plugin ecosystem
- **Custom Module** at `modules/general/` for application-specific logic
- **Environment Configuration** validated through `utility/env.js`
- **Twig Templates** in `templates/` with component-based structure

### Build System
- **Vite Configuration** (`vite.config.js`) with:
  - Asset optimization (TinyPNG, SVGO)
  - Code splitting for Svelte and Zod
  - Path aliases: `$lib`, `$css`, `$img`, `$fontawesome`
  - LightningCSS for optimized CSS processing

## Key File Locations

### Configuration
- `composer.json` - PHP dependencies and Craft CMS plugins
- `package.json` - Node.js dependencies (Bun preferred)
- `vite.config.js` - Build configuration and asset processing
- `tsconfig.json` - TypeScript configuration with path aliases
- `.env.example` - Environment variable template

### Source Code
- `src/lib/init.js` - Module initialization system
- `src/lib/schemas.js` - Zod validation schemas
- `src/env.d.ts` - Global TypeScript definitions
- `modules/general/General.php` - Custom Craft module
- `templates/` - Twig templates organized by content type

### Utilities and Scripts
- `utility/env.js` - Environment variable validation
- `utility/install.sh` - Project setup automation
- `utility/vite-plugin-*.js` - Custom Vite plugins for asset optimization

## Development Workflow Patterns

### Adding New Features
1. Define data schemas in `src/lib/schemas.js`
2. Create feature modules in `src/lib/modules/`
3. Add corresponding CSS in `src/css/components/`
4. Use data attributes for automatic module loading
5. Update TypeScript definitions in `src/env.d.ts` if needed

### Asset Management
- Images automatically optimized via TinyPNG plugin
- SVGs optimized through SVGO plugin
- FontAwesome Pro icons accessible via `$fontawesome` alias
- Tailwind CSS for utility-first styling

## Craft CMS Specifics

### Database Operations
Use `./craft` command for:
- `./craft install` - Initial Craft installation
- `./craft migrate/all` - Run database migrations
- `./craft queue/run` - Process background jobs
- `./craft project-config/apply` - Apply project configuration

### Plugin Ecosystem
Key plugins configured:
- `craftcms/ckeditor` - Rich text editing
- `nystudio107/craft-vite` - Vite integration
- `nystudio107/craft-seomatic` - SEO management
- `verbb/icon-picker` - Icon selection interface
- `spicyweb/craft-embedded-assets` - External media integration

### Content Architecture
- Entry types configured in `config/project/entryTypes/`
- Fields defined in `config/project/fields/`
- Sections organized in `config/project/sections/`
- Templates follow entry type naming conventions in `templates/`
