# Configuration Directory (`config/`)

The configuration directory contains all Craft CMS settings, plugin configurations, and project structure definitions. This follows Craft's configuration best practices with environment-specific settings and version-controlled project configuration.

## Core Configuration Files

### Application Configuration

- **`app.php`** - Core application settings including module registration and bootstrapping. Registers the General module and sets the application ID from environment variables.

- **`general.php`** - Main Craft CMS configuration covering security, performance, and site behavior settings. Includes timezone, URL handling, upload limits, session durations, and path aliases.

- **`routes.php`** - URL routing configuration for custom routes and URL patterns not handled by Craft's default structure.

- **`redirects.php`** - URL redirect rules for handling legacy URLs and site migrations.

### Plugin Configuration

- **`vite.php`** - Vite build tool integration settings for asset bundling and development server configuration.

- **`element-api.php`** - Element API plugin configuration for creating JSON endpoints from Craft content.

- **`colour-swatches.php`** - Color swatches plugin settings for custom color picker functionality.

- **`environment-label.php`** - Environment labeling plugin configuration for visual environment identification in the control panel.

- **`sentry-sdk.php`** - Sentry error tracking and performance monitoring configuration.

### Custom Configuration

- **`custom.php`** - Project-specific custom configuration including fonts and color palette definitions. Contains structured color collections used throughout templates and frontend components.

- **`license.key`** - Craft CMS license file (not version controlled).

## Project Configuration (`project/`)

Contains Craft's project configuration system files in YAML format. These files define content structure, fields, sections, and plugin settings that are automatically synced across environments through Craft's project config system.

## Additional Configuration

- **`htmlpurifier/Default.json`** - HTML Purifier configuration for content sanitization and security.

## Environment-Specific Settings

Configuration files use Craft's environment-aware configuration pattern:

```php
return [
    '*' => [
        // Settings for all environments
    ],
    'dev' => [
        // Development-specific settings
    ],
    'staging' => [
        // Staging-specific settings  
    ],
    'production' => [
        // Production-specific settings
    ],
];
```

## Configuration Management Best Practices

### Project Config Sync

Craft's project configuration system automatically syncs structural changes:
- Changes made in the control panel are saved to YAML files
- YAML files are version controlled and deployed across environments
- Use `ddev craft up` to sync changes to database

### Environment Variables

Sensitive configuration values use environment variables:
- Database credentials in `.env`
- API keys and secrets in environment-specific files
- Use `App::env()` helper for environment variable access

### Custom Settings Access

Custom configuration is accessible in templates and PHP:

```php
// In PHP
$fonts = Craft::$app->config->custom->fonts;
```

```twig
// In Twig templates
{{ craft.app.config.custom.fonts.adobe }}
{{ swatch(palette, 'background', 'text') }}
```
