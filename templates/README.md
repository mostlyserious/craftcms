# Templates Directory (`templates/`)

The templates directory contains all Twig templates for the Craft CMS frontend, organized around a component-based architecture that emphasizes reusability, performance, and maintainability.

## Architecture Overview

This template system follows a **hierarchical, component-based architecture** with clear separation of concerns:

### Template Inheritance Hierarchy

```
_base.twig (Foundation)
    ↓
_main.twig (Layout Structure)
    ↓
{section}/_entry.twig (Content Types)
    ↓
blocks/_entry.twig (Block System)
    ↓
blocks/_{blockType}.twig (Individual Components)
```

### Core Design Principles

1. **Component Reusability**: Shared components for headers, navigation, and content blocks
2. **Performance-First**: Template caching, lazy loading, and optimized asset delivery
3. **Accessibility**: Semantic HTML, proper ARIA labels, and keyboard navigation
4. **Progressive Enhancement**: Works without JavaScript, enhanced with it
5. **Responsive Design**: Mobile-first approach with Tailwind CSS utilities

## Directory Structure

```
templates/
├── _base.twig                 # HTML foundation and global layout
├── _main.twig                 # Site structure and navigation blocks
├── blocks/                    # Reusable content components
│   ├── _entry.twig            # Block system orchestrator
│   ├── _billboard.twig        # Hero sections with background images
│   ├── _group.twig            # Nested block containers
│   ├── _imageText.twig        # Image and text combinations
│   └── _text.twig             # Rich text content blocks
├── common/                    # Shared interface components
│   ├── _footer.twig           # Site footer with navigation
│   ├── _mobileNavigation.twig # Mobile-optimized navigation
│   ├── _navigation.twig       # Primary site navigation
│   ├── _quickEdit.twig        # Admin quick-edit interface
│   └── _topBar.twig           # Flash messages and notifications
├── cp/                        # Control panel templates
│   └── _guide.twig            # CMS Guide plugin template
├── headers/                   # Page header components
│   ├── _entry.twig            # Header block orchestrator
│   └── _header.twig           # Default page header layout
└── {section}/                 # Content type templates
    ├── home/_entry.twig       # Homepage template
    └── pages/_entry.twig      # Generic page template
```

## Template Patterns and Conventions

### Foundation Template (`_base.twig`)

The base template establishes the HTML document structure and provides:

**Core Features:**
- Semantic HTML5 document structure
- Meta tags and SEO optimization integration
- Performance optimizations (preconnect, preload)
- View transitions API support
- Custom CSS properties for JavaScript integration
- Accessibility features (skip links, focus management)

**Block Structure:**
```twig
{% block navigation %}   <!-- Site navigation -->
{% block main %}         <!-- Main content area -->
{% block footer %}       <!-- Site footer -->
```

**Key Patterns:**
- Environment-based asset optimization
- Web font loading with `display: swap`
- Frontend configuration via JavaScript globals
- CSRF token management for AJAX requests

### Layout Template (`_main.twig`)

Extends `_base.twig` and provides the standard site layout:

**Responsibilities:**
- Access control for protected sections
- Navigation and footer inclusion
- Block system integration
- Layout-specific styling and behavior

### Content Type Templates (`{section}/_entry.twig`)

Follow a consistent pattern for content rendering:

```twig
{% extends '_main' %}

{% block main %}
    {{ include('headers/_entry', {
        block: entry.header.one,
    }) }}

    {{ include('blocks/_entry', {
        nested: false,
        branded: true,
    }) }}
{% endblock %}
```

**Key Characteristics:**
- Always extend `_main.twig`
- Include header and block sections
- Pass configuration via context variables
- Consistent parameter naming

### Block System Architecture (`blocks/`)

#### Block Orchestrator (`blocks/_entry.twig`)

The central component that manages block rendering with sophisticated logic:

**Core Features:**
- Dynamic block loading based on type handle
- Intelligent padding and spacing management
- Color palette and theming system
- Template caching for performance
- Development mode debugging markers
- Nested block support

**Key Variables:**
- `blocks`: Collection of blocks to render
- `nested`: Boolean for nested block contexts
- `branded`: Boolean for brand-specific styling
- `palette`: Dynamic color theming
- `padding`: Responsive spacing classes

**Caching Strategy:**
```twig
{% cache using key block.uid ~ block.dateUpdated.format('U') %}
{{ include("blocks/_#{block.type.handle}", ignore_missing=true) }}
{% endcache %}
```

#### Individual Block Components

Each block type follows consistent patterns:

**Standard Structure:**
```twig
{# Conditional rendering based on content #}
{% if block.content|plain %}
    <section class="{{ swatch(palette, 'background', 'text') }}" data-animate>
        <div class="{{ padding }}">
            <!-- Block content -->
        </div>
    </section>
{% endif %}
```

**Common Patterns:**
- Content existence checks using `|plain` filter
- Color theming via `swatch()` function
- Animation attributes with `data-animate`
- Responsive padding classes
- Semantic HTML structure

### Navigation System (`common/`)

#### Primary Navigation (`_navigation.twig`)
- Dropdown menu support with keyboard navigation
- Mobile toggle integration
- ARIA labels for accessibility
- SVG icon integration
- Conditional button styling

#### Mobile Navigation (`_mobileNavigation.twig`)
- Touch-optimized interface
- Collapsible menu structure
- Focus trap for accessibility
- Scroll lock when open

#### Footer (`_footer.twig`)
- Legal link integration
- Copyright information
- Responsive layout adaptation
- Brand attribution

### Header System (`headers/`)

Dynamic header rendering based on block types:
```twig
{{ include("headers/_#{block.type.handle|default('header')}", ignore_missing=true) }}
```

**Default Header Features:**
- Background image support with CSS optimization
- Overlay effects for text readability
- Responsive typography scaling
- Content existence checking

## Development Patterns and Best Practices

### Content Existence Checking

Always check for content before rendering:
```twig
{% if block.richText|plain or block.heading|plain %}
    <!-- Render content -->
{% endif %}

{% if block.excerpt|plain %}
    <div class="prose">{{ block.excerpt }}</div>
{% endif %}
```

### Color Theming System

Consistent theming across all components:
```twig
{# Block-level theming #}
<section class="{{ swatch(palette, 'background', 'text') }}">

{# Global theming #}  
<section class="{{ swatch(palettes.misc.footer, 'background', 'text') }}">
```

### Animation Integration

Consistent animation attributes for frontend JavaScript using Motion One library:
```twig
<div data-animate>                           <!-- Basic fade-in animation -->
<div data-animate="y: 20px, 0">            <!-- Slide up from 20px -->
<div data-animate="scale: 0.8, 1">         <!-- Scale from 80% to 100% -->
<div data-animate="x: -30px, 0; rotate: -5deg, 0deg"> <!-- Multi-property animation -->
```

**Animation System Features:**
- **Property Syntax**: `property: startValue, endValue` (endValue defaults to 0 if omitted)
- **Multiple Properties**: Separated by semicolons (`;`)
- **Default Opacity**: Automatically adds `opacity: 0, 1` if not specified
- **Timing Controls**: 
  - `data-animate-duration="0.5"` - Animation duration in seconds
  - `data-animate-delay="0.2"` - Delay before animation starts
  - `data-animate-ease="easeOut"` - Easing function
  - `data-animate-repeat` - Repeats animation when re-entering viewport
- **Smart Image Loading**: Waits for image load before animating

### Responsive Design Patterns

Mobile-first responsive design using Tailwind utilities:
```twig
{# Progressive disclosure #}
<span class="block md:inline">
<nav class="hidden lg:block">

{# Responsive typography #}
<h1 class="text-4xl md:text-5xl lg:text-6xl">

{# Adaptive spacing #}
<div class="py-8 md:py-16 lg:py-24">
```

### Asset Optimization Patterns

Leveraging custom Twig functions for performance:
```twig
{# Responsive images with breakpoints #}
{{ image(asset, baseArgs, {
    (screen.md): mediumArgs,
    (screen.lg): largeArgs
}) }}

{# Background images #}
style="background-image: url({{ src(asset, {
    fit: 'crop',
    width: 1400,
    height: 600
}) }});"
```

### Template Inclusion Patterns

Consistent include syntax with proper context:
```twig
{# Safe inclusion with fallback #}
{{ include('component/_name', ignore_missing=true) }}

{# Context passing #}
{{ include('blocks/_entry', {
    blocks: customBlocks,
    nested: true,
    branded: false
}) }}
```

### Error Handling and Debugging

Development-friendly debugging support:
```twig
{# Development mode block markers #}
{{ craft.app.config.general.devMode ? ("<!-- START #{block.type.handle}:#{block.id} -->")|raw }}

{# Safe property access #}
{{ block.heading|default(entry.title)|heading }}
```

### Performance Optimization Strategies

#### Template Caching
- Block-level caching based on UID and modification time
- Selective caching exclusion for dynamic content
- Cache invalidation through content updates

#### Asset Loading
- Preconnect hints for external resources
- Preload directives for critical assets
- Lazy loading for images and media
- CDN optimization through environment variables

#### JavaScript Integration
- Progressive enhancement patterns
- Custom element definitions for Svelte components
- Configuration injection via global variables
- CSRF token management for secure AJAX

## Extending the Template System

### Adding New Block Types

1. **Create Block Template**: Add `blocks/_newBlockType.twig`
2. **Follow Naming Convention**: Use snake_case matching Craft field handle
3. **Implement Standard Pattern**: Include theming, animation, and responsive support
4. **Test Integration**: Verify block orchestrator picks up new template

### Creating New Content Types

1. **Follow Directory Structure**: Create `{section}/_entry.twig`
2. **Extend Base Layout**: Always extend `_main.twig`
3. **Include Standard Components**: Header and block sections
4. **Configure Context Variables**: Pass appropriate settings

### Adding Shared Components

1. **Place in Common Directory**: Add to `common/` for reusable components
2. **Follow Naming Convention**: Use underscore prefix (`_componentName.twig`)
3. **Document Parameters**: Include context requirements in comments
4. **Ensure Accessibility**: Follow semantic HTML and ARIA patterns

## Integration Points

### Frontend Asset System
- Vite integration for development and production builds
- Asset path resolution through `craft.vite.asset()`
- Environment-based CDN switching
- Automatic cache busting

### Craft CMS Integration
- Entry and matrix field rendering
- User authentication and permissions
- Template caching system
- SEOmatic integration for meta tags

### Custom Module Integration  
- Twig extension functions and filters
- Serializer service for data formatting
- Color palette configuration
- Animation and interaction hooks
