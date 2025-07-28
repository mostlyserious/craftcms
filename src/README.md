# Source Directory (`src/`)

The source directory contains all frontend assets, components, and application logic organized around a modular, schema-driven architecture that supports both public-facing and administrative interfaces.

## Entry Points

The project uses a dual entry point system to support different application contexts:

- **`app.js`** - Main application entry point for public-facing features
- **`dashboard.js`** - Administrative interface entry point for Craft CMS dashboard integration

This separation allows for context-specific optimizations and feature sets while maintaining shared underlying architecture.

## Directory Structure & Patterns

### `/css` - Stylesheet Organization

The CSS architecture follows a structured approach that promotes maintainability and component reusability:

```
css/
├── setup/          # Base styles and theme definitions
├── components/     # Reusable UI component styles
├── utilities/      # Utility classes and helpers
├── app.css         # Main application stylesheet
├── dashboard.css   # Dashboard-specific styles
└── reference.css   # Component development reference
```

**Established Patterns:**
- **Layered Architecture**: Setup → Components → Utilities for predictable cascade
- **Context Separation**: Distinct stylesheets for different application contexts
- **Component-Driven**: Individual CSS files for each major component (drawer, dropdown, form, etc.)
- **Utility-First Enhancements**: Custom utilities complement Tailwind CSS framework

#### Special File: `reference.css`
This file serves as a development tool for Single File Components (SFCs). Import this file into Svelte, Vue, or similar components to access all PostCSS features.

### `/lib` - Shared Application Logic

The lib directory contains reusable application logic organized by architectural concerns:

```
lib/
├── components/    # Reusable UI components
├── modules/       # Feature-specific modules
├── stores/        # Global state management
├── util/          # Pure utility functions
├── init.js        # Module initialization system
├── schemas.js     # Validation schemas
└── sveltify.js    # DOM-to-Svelte integration
```

**Established Patterns:**
- **Feature Modules**: Each module handles a specific UI behavior (animate, lightbox, toggle, etc.)
- **Schema-Driven Development**: Extensive use of Zod for runtime validation and type safety
- **Dynamic Module Loading**: Modules are loaded on-demand based on DOM selectors
- **Utility-First Functions**: Pure functions for common operations (throttle, focus-trap, image processing)

#### Key Architectural Files

**`init.js` - Module Initialization System**
Implements a selector-based module loading system that scans the DOM for data attributes and dynamically imports corresponding functionality. This pattern enables:
- Lazy loading of features
- Automatic feature detection
- Minimal initial bundle size
- Progressive enhancement

**`schemas.js` - Validation Layer**
Centralizes Zod schemas for data validation, including specialized schemas for:
- Image and video assets with metadata
- Embed content from external sources
- Promise-based validation for async operations

**`sveltify.js` - Component Integration**
Bridges the gap between server-rendered markup and client-side Svelte components.

### `/img` - Static Assets

Contains project-specific images and graphics that are processed through the build pipeline. Assets here benefit from:
- Automatic optimization via TinyPNG integration
- SVG optimization through SVGO
- Vite's asset processing and versioning

## Architectural Patterns

### Schema-Driven Development
The codebase extensively uses Zod schemas for:
- Runtime data validation
- TypeScript type inference
- API contract enforcement
- Component prop validation

### Module Federation
The selector-based module system enables:
- Feature-specific code splitting
- Lazy loading based on actual usage
- Reduced initial bundle size
- Maintainable feature organization

### Dual Context Architecture
Separate entry points and stylesheets support:
- Public-facing optimizations
- Administrative tool integration
- Context-specific feature sets
- Independent deployment strategies

## TypeScript Integration

### Special File: `env.d.ts`
This file extends the global scope with project-specific type definitions, including:

- **Window Extensions**: Defines the global `$app` object with Craft CMS integration points
- **Enhanced JSON Types**: Provides strict typing for JSON serialization/deserialization
- **Utility Types**: Adds helpful type utilities like `Prettify`, `Mutable`, and method extraction
- **Framework Integration**: Includes Svelte and Vite type references

The global type definitions ensure type safety across the entire application while providing seamless integration with Craft CMS's server-side data configured in `templats/_base.twig`.

## Development Workflow

The source architecture supports modern development practices:

1. **Component Development**: Use `reference.css` imports for full PostCSS feature access
2. **Feature Addition**: Add modules with corresponding DOM selectors for automatic loading
3. **Schema Definition**: Define data contracts in `schemas.js` for validation and type safety
4. **Progressive Enhancement**: Build components that enhance existing markup
5. **Context Separation**: Choose appropriate entry points for different application areas
