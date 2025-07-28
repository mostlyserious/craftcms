# Twig Extension (`modules/general/web/twig/`)

This directory contains the `GeneralExtension` class, which significantly extends Twig templating capabilities for the Craft CMS project with custom functions, filters, and global variables optimized for modern web development.

## GeneralExtension.php Deep Dive

The `GeneralExtension` class (`modules/general/web/twig/GeneralExtension.php`) is a comprehensive Twig extension that provides essential functionality for asset management, responsive design, content formatting, and external integrations.

### Architecture Overview

The extension follows these core architectural principles:

- **Singleton Pattern**: Uses static instance management for consistent behavior
- **Type Safety**: Implements strict typing throughout with PHP 8+ syntax
- **Security-First**: All HTML output is properly sanitized and marked as safe where appropriate
- **Performance Optimized**: Lazy loading, caching, and efficient asset processing
- **Extensible Constants**: Centralized configuration through class constants

### Class Constants

#### `HTML_SAFE`
```php
const HTML_SAFE = ['is_safe' => ['html']];
```
Applied to functions that return sanitized HTML content, telling Twig not to double-escape the output.

#### `IMGIX_DEFAULTS`
```php
const IMGIX_DEFAULTS = ['auto' => 'format,compress'];
```
Default Imgix parameters for automatic format optimization and compression.

#### `LINK_ATTRS`
```php
const LINK_ATTRS = [
    'label', 'urlSuffix', 'target', 'title', 'class', 
    'id', 'rel', 'ariaLabel', 'download'
];
```
Whitelisted attributes for the `link()` function, ensuring only valid HTML attributes are processed.

#### `LINK_TYPES`
```php
const LINK_TYPES = [
    'category' => CategoryLink::class,
    'asset' => AssetLink::class, 
    'email' => EmailLink::class,
    'entry' => EntryLink::class,
    'phone' => PhoneLink::class,
    'sms' => SmsLink::class,
    'url' => UrlLink::class,
];
```
Maps string identifiers to Craft CMS LinkData type classes for the `createLink()` function.

## Global Variables

The extension provides several globally accessible variables in Twig templates:

### `screen`
Responsive breakpoint definitions matching Tailwind CSS conventions, specifically designed for use with the `image()` function's responsive sources parameter:

```twig
{# Available breakpoints #}
{{ screen['2xs'] }} {# 370 #}
{{ screen.xs }}     {# 460 #}
{{ screen.sm }}     {# 640 #}
{{ screen.md }}     {# 768 #}
{{ screen.lg }}     {# 1024 #}
{{ screen.xl }}     {# 1280 #}
{{ screen['2xl'] }} {# 1400 #}
```

**Primary Usage**: Defining responsive image breakpoints in the `image()` function:

```twig
{# From templates/blocks/_imageText.twig #}
{{ image(block.featuredImage.eagerly().one, {
    fit: 'crop',
    width: 430,
    height: 280,
}, {
    (screen.xs): {
        fit: 'crop',
        width: 610,
        height: 400,
    },
    (screen.sm): {
        fit: 'crop',
        width: 290,
        height: 290,
    },
    (screen.md): {
        fit: 'crop',
        width: 450,
        height: 450,
    },
}) }}

{# From templates/blocks/_billboard.twig #}
{{ image(backgroundImage, {
    fit: 'crop',
    width: 800,
    height: 800,
}, {
    (screen.md): {
        fit: 'crop',
        width: 1600,
        height: 800,
    },
}) }}
```

### `palettes`
Access to custom color configuration from Craft's config, used extensively with the `swatch()` function:
```twig
{# From templates/common/_footer.twig #}
{{ swatch(palettes.misc.footer, 'background', 'text') }}

{# From templates/blocks/_text.twig #}
{{ swatch(palette, 'background', 'text') }}
```

### `DATE_FORMAT`, `TIME_FORMAT`, `HEADING_TAGS`
Constants from the Serializer service for consistent formatting across templates.

## Custom Functions

### `image(asset, args, sources, lazy, tag)` 
**Most Complex Function** - Advanced responsive image rendering with Imgix optimization.

**Parameters:**
- `asset` (Asset|string|null): Craft Asset, placeholder seed string, or null
- `args` (array): Image transformation parameters (width, height, fit, etc.)
- `sources` (array): Responsive breakpoint definitions for `<picture>` element
- `lazy` (bool): Enable lazy loading (default: true)
- `tag` (string): HTML tag to generate ('img' or 'source')

**Key Features:**
- **Automatic 2x Retina Support**: Generates 2x resolution sources automatically
- **Focal Point Integration**: Uses Craft Asset focal points for intelligent cropping
- **GIF Handling**: Bypasses optimization for animated GIFs
- **Placeholder Generation**: Creates Lorem Picsum placeholders from seed strings
- **Picture Element Support**: Generates complete `<picture>` elements with multiple sources
- **Lazy Loading**: Implements progressive image loading with opacity animations
- **Asset URL Transformation**: Handles both local and CDN/Imgix URLs

**Real Usage Examples:**
```twig
{# Billboard background image - templates/blocks/_billboard.twig #}
{{ image(backgroundImage, {
    fit: 'crop',
    width: 800,
    height: 800,
}, {
    (screen.md): {
        fit: 'crop',
        width: 1600,
        height: 800,
    },
})|attr({
    class: '*:absolute *:inset-0 *:object-center *:object-cover *:w-full *:h-full',
    role: 'presentation',
}) }}

{# Featured image with complex responsive breakpoints - templates/blocks/_imageText.twig #}
{{ image(block.featuredImage.eagerly().one, {
    fit: 'crop',
    width: 430,
    height: 280,
}, {
    (screen.xs): {
        fit: 'crop',
        width: 610,
        height: 400,
    },
    (screen.sm): {
        fit: 'crop',
        width: 290,
        height: 290,
    },
    (screen.md): {
        fit: 'crop',
        width: 450,
        height: 450,
    },
})|attr({
    class: '*:rounded',
}) }}
```

### `src(asset, args)`
Generates optimized image URLs without HTML markup, primarily used for CSS background images. Automatically applies `IMGIX_DEFAULTS` (`auto: 'format,compress'`) for optimization.

**Parameters:**
- `asset` (Asset|string|null): Asset or placeholder seed
- `args` (array): Transformation parameters

**Key Features:**
- **Automatic Optimization**: Applies `IMGIX_DEFAULTS` for format and compression optimization
- **Focal Point Support**: Uses Asset focal points for intelligent cropping
- **GIF Handling**: Bypasses optimization for animated GIFs
- **Placeholder Generation**: Creates Lorem Picsum URLs from seed strings

**Real Usage Example:**
```twig
{# CSS background image - templates/headers/_header.twig #}
<section class="flex relative bg-gray-100 bg-center bg-cover min-h-[30dvh]"
    {% if featuredImage %}
        style="background-image: url({{ src(featuredImage, {
            fit: 'crop',
            width: 1400,
            height: 600,
        }) }});"
    {% endif %}>
```

### `link(linkData, args, wrap)`
Renders Craft LinkData objects as complete HTML anchor elements. Used extensively throughout navigation and content blocks.

**Parameters:**
- `linkData` (LinkData|null): Craft LinkData object
- `args` (array): Additional HTML attributes and content modifiers
- `wrap` (string): Optional wrapper element tag

**Real Usage Examples:**
```twig
{# Button with wrapper - templates/blocks/_imageText.twig #}
{{ link(block.button, {
    class: 'button button-blue',
}, 'div')|attr({
    data: { animate: true },
}) }}

{# Navigation dropdown links - templates/common/_navigation.twig #}
{{ link(child.button, {
    class: 'dropdown-link',
}, 'li')|attr({
    class: 'dropdown-item',
}) }}

{# Conditional button styling - templates/common/_navigation.twig #}
{{ link(item.button, {
    class: loop.index == navigation.main|length
        ? 'button button-blue'
        : 'navbar-link',
}, 'li')|attr({
    class: 'navbar-item',
}) }}

{# Simple footer links - templates/common/_footer.twig #}
{{ link(item.button) }}
```

### `svg(asset, sanitize, namespace, throwException)`
Renders inline SVG content, primarily used for FontAwesome icons

**Parameters:**
- `asset` (Asset|string): SVG asset or file path
- `sanitize` (bool): Enable SVG sanitization (default: true)
- `namespace` (bool|null): Add XML namespace
- `throwException` (bool): Throw exceptions on errors

**Real Usage Examples:**
```twig
{# FontAwesome icons - templates/common/_navigation.twig #}
{{ svg('@fontawesome/solid/chevron-down.svg')|attr({
    class: 'transition fill-current size-3',
}) }}

{# Edit icon - templates/common/_quickEdit.twig #}
{{ svg('@fontawesome/regular/pen-to-square.svg')|attr({
    class: 'fill-current size-3',
}) }}

{# Mobile navigation arrow - templates/common/_mobileNavigation.twig #}
{{ svg('@fontawesome/solid/chevron-right.svg')|attr({
    class: 'transition fill-current size-3',
}) }}
```

### `external(path)`
Includes external file contents in templates, used for including pre-built markup.

**Real Usage Example:**
```twig
{# Include external markup file - templates/_base.twig #}
{{ external('@webroot/static/assets/markup.html')|striptags('<link><meta>')|raw }}
```

### `swatch(palette, ...keys)`
Extracts specific color values from palette collections. Used extensively for theming blocks and components.

**Real Usage Examples:**
```twig
{# Footer theming - templates/common/_footer.twig #}
<section class="{{ swatch(palettes.misc.footer, 'background', 'text') }}">

{# Block theming - templates/blocks/_text.twig #}
<section class="{{ swatch(palette, 'background', 'text') }}" data-animate>

{# Billboard theming - templates/blocks/_billboard.twig #}
<section class="relative overflow-hidden {{ swatch(palette, 'background', 'text') }}" data-animate>
```

### `localizations(lang, domain, flatten)`
Accesses translation files for internationalization, used for frontend JavaScript i18n data.

**Real Usage Example:**
```twig
{# Frontend i18n data - templates/_base.twig #}
window.$app.config = {{ {
    // ... other config
    lang: craft.app.language,
    i18n: localizations(craft.app.language, 'site'),
    // ... more config
}|json_encode|raw }};
```

## Custom Filters

### `plain`
Strips HTML tags using the Serializer service. Primarily used for conditional content checks and clean text output.

**Real Usage Examples:**
```twig
{# Content existence checks - templates/blocks/_text.twig #}
{% if block.richText|plain or block.heading|plain %}
    <!-- render content -->
{% endif %}

{# Header existence check - templates/blocks/_text.twig #}
{% if block.heading|plain %}
    <header class="mb-4" data-animate>
        <h2 class="text-3xl md:text-4xl">
            {{ block.heading|heading }}
        </h2>
    </header>
{% endif %}

{# Excerpt check - templates/blocks/_billboard.twig #}
{% if block.excerpt|plain %}
    <div class="prose {{ branded ? 'prose-brand' }}" data-animate>
        {{ block.excerpt }}
    </div>
{% endif %}
```

### `heading`
Sanitizes heading content, allowing only safe HTML tags. Used for all heading content across templates.

**Real Usage Examples:**
```twig
{# Page headers - templates/headers/_header.twig #}
<h1 class="text-4xl font-bold uppercase md:text-5xl">
    {{ block.heading|default(entry.title)|heading }}
</h1>

{# Block headings - templates/blocks/_text.twig #}
<h2 class="text-3xl md:text-4xl">
    {{ block.heading|heading }}
</h2>

{# Billboard headings - templates/blocks/_billboard.twig #}
<h2 class="text-4xl md:text-5xl lg:text-6xl">
    {{ block.heading|heading }}
</h2>

{# Image-text block headings - templates/blocks/_imageText.twig #}
<h2 class="text-3xl sm:text-4xl" data-animate>
    {{ block.heading|heading }}
</h2>
```

### `media`
Transforms rich text content with automatic `srcset` generation for responsive images embedded in content.

**Real Usage Example:**
```twig
{# Rich text with responsive images - templates/blocks/_text.twig #}
<div class="prose {{ branded ? 'prose-brand' }}" data-animate>
    {{ block.richText|media(976) }}
</div>
```

## Functions Available But Not Currently Used

The following functions are available in the extension but are not currently used in the templates:

### `stringy(string)`
Provides access to the Stringy library for advanced string manipulation.

### `createLink(value, type)`
Programmatically creates LinkData objects from values.

### Filters: `tel`, `mailto`
Convert phone numbers and email addresses to proper link formats.

## Implementation Details

### Asset URL Transformation

The extension handles multiple asset scenarios:

1. **Local Assets**: Standard Craft asset URLs
2. **CDN Assets**: Transforms `OBJECT_STORAGE_URL` to `ASSETS_URL` for Imgix processing
3. **Placeholder Images**: Generates Lorem Picsum URLs with seed-based consistency

### Responsive Image Strategy

The `image()` function implements a comprehensive responsive image strategy:

1. **Automatic Retina Support**: Every image gets a 2x version for high-DPI displays
2. **Smart Cropping**: Uses Asset focal points when available, falls back to face detection
3. **Format Optimization**: Automatically serves WebP/AVIF when supported
4. **Lazy Loading**: Progressive loading with smooth opacity transitions
5. **Picture Element Generation**: Complex responsive layouts with multiple breakpoints

### Performance Optimizations

- **Singleton Pattern**: Prevents multiple extension instances
- **Static Method Caching**: Reduces overhead for utility functions
- **Conditional Processing**: Skips expensive operations when not needed
- **Asset URL Caching**: Avoids redundant URL transformations

### Security Considerations

- **HTML Sanitization**: All user content is properly escaped
- **SVG Security**: Optional sanitization for inline SVG content
- **Email Filtering**: Uses PHP's `FILTER_SANITIZE_EMAIL` for email addresses
- **Attribute Whitelisting**: Only allows known-safe HTML attributes

## Extension Integration

This extension integrates seamlessly with:

- **Craft CMS Asset System**: Full support for focal points, transforms, and metadata
- **Imgix CDN**: Automatic optimization and format conversion
- **Tailwind CSS**: Breakpoint definitions match Tailwind conventions
- **Serializer Service**: Consistent data formatting across the application
- **LinkData System**: Complete integration with Craft's link field system
- **FontAwesome Pro**: Direct SVG access via path aliases
