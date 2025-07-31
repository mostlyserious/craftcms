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

Transforms server-rendered HTML elements into dynamic Svelte components. This system enables client-side enhancement by replacing static markup with interactive components while preserving SEO benefits during server-side rendering.

#### How Sveltify Works

The sveltify system processes specially marked DOM elements and replaces them with mounted Svelte components. It handles data transformation, snippet extraction, and component mounting automatically.

#### Static HTML Template Requirements

To use sveltify, your static HTML templates must follow these markup patterns:

**Basic Component Structure:**

```html
<x-svelte component="video" data-uid="123e4567-e89b-12d3-a456-426614174000">
    <!-- Content will be replaced by Svelte component -->
</x-svelte>
```

**Required Attributes:**

- `component` - Specifies which Svelte component to mount (must match a key in the components registry)
- Must use the `<x-svelte>` custom element tag

#### Data Property Translation

All `data-*` attributes on the target element are automatically converted to component props with intelligent type parsing:

**Data Attribute Examples:**

```html
<x-svelte component="video"
    data-uid="123e4567-e89b-12d3-a456-426614174000"
    data-play-inline="true"
    data-config='{"autoplay": false, "controls": true}'
    data-delay="1500">
</x-svelte>
```

**Automatic Type Conversion:**

- `"true"` / `"false"` → boolean values
- `"null"` / `"undefined"` → null/undefined values
- `"123"` → integer (no decimal point)
- `"123.45"` → float (with decimal point)
- `'{"key": "value"}'` → parsed JSON object/array
- Other strings → remain as strings

**Naming Convention:**

- `data-play-inline` becomes prop `playInline` (camelCase conversion)
- `data-video-id` becomes prop `videoId`

#### Template Snippet Integration

HTML `<template>` elements within the component container are converted to Svelte snippets:

**Snippet Definition:**

```html
<x-svelte component="card" data-title="Product Showcase" data-featured="true">
    <template snippet="header">
        <div class="flex items-center gap-2">
            <span class="badge">New</span>
            <h3>Custom Product Title</h3>
        </div>
    </template>

    <template snippet="actions">
        <button class="btn-primary">Add to Cart</button>
        <button class="btn-secondary">Save for Later</button>
    </template>
</x-svelte>
```

**Snippet Features:**

- `snippet` attribute defines the snippet name (defaults to `"children"` if omitted)
- Snippet content is preserved as raw HTML markup
- Snippets are passed as props to the Svelte component
- Multiple snippets per component are supported
- Snippet names cannot conflict with data attribute names

#### Component Implementation Requirements

Svelte components used with sveltify must follow these patterns:

**Component Props Validation:**

```javascript
import { CardSchema } from "$lib/components/schemas";

/** @type {ZodInfer<typeof CardSchema>} */
const props = $props();
const { title, featured = false, header, actions } = CardSchema.parse(props);
```

**Snippet Usage in Components:**

```svelte
{#if header}
    {@render header()}
{:else}
    <h3>{title}</h3>
{/if}

{#if actions}
    {@render actions()}
{:else}
    <!-- Default actions -->
    <button>View Details</button>
{/if}
```

#### Usage Examples

**Video Component with External API:**

```html
<x-svelte component="video" data-uid="123e4567-e89b-12d3-a456-426614174000">
    <!-- Will fetch video data from /api/embed/{uid} -->
</x-svelte>
```

**Card Component with Custom Content:**

```html
<x-svelte component="card"
    data-title="Featured Product"
    data-featured="true"
    data-price="29.99">
    <template snippet="header">
        <div class="flex items-center justify-between">
            <span class="badge badge-new">New Arrival</span>
            <span class="price">${price}</span>
        </div>
    </template>
    
    <template snippet="actions">
        <button class="btn-primary w-full">Add to Cart</button>
        <button class="btn-link">View Details</button>
    </template>
</x-svelte>
```

**Modal Video Player:**

```html
<x-svelte component="video"
    data-uid="123e4567-e89b-12d3-a456-426614174000"
    data-play-inline="false">
    <!-- Opens in full-screen modal when triggered -->
</x-svelte>
```

#### Error Handling

The system includes built-in error handling for common issues:

**Naming Conflicts:**

```html
<!-- ERROR: data-header conflicts with snippet name -->
<x-svelte component="card" data-header="custom-class">
    <template snippet="header">Content</template>
</x-svelte>
```

**Duplicate Snippets:**

```html
<!-- ERROR: duplicate snippet names -->
<x-svelte component="card">
    <template snippet="actions">First actions</template>
    <template snippet="actions">Second actions</template>
</x-svelte>
```

**Invalid Component Names:**

```html
<!-- ERROR: 'gallery' not registered in components -->
<x-svelte component="gallery">Content</x-svelte>
```

#### Integration with Module System

Sveltify integrates with the broader module initialization system:

- Components are lazy-loaded only when needed
- DOM elements are processed automatically during module initialization
- Supports both server-side rendering and client-side hydration
- Works seamlessly with Craft CMS's template system

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
