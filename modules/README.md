# Modules Directory (`modules/`)

The modules directory contains custom Craft CMS modules that extend the core functionality with application-specific features. This project follows Craft CMS conventions and leverages the `craftcms/generator` package for consistent code generation.

## Current Modules

### General Module (`general/`)

The General module provides core application functionality including content serialization, Twig extensions, and oEmbed integration.

**Key Features:**
- **Content Serialization**: Standardized data transformation for frontend consumption
- **Enhanced Twig Functions**: Custom template functions for assets, links, and media handling
- **oEmbed Integration**: External content embedding via the `spicyweb/embeddedassets` plugin
- **Asset Management**: Automated filename randomization for replaced assets
- **Development Tools**: Marker.io integration for staging environments

## Module Architecture

### Directory Structure

```
modules/
└── general/
    ├── General.php              # Main module class
    ├── controllers/             # Web and console controllers
    │   └── OembedController.php # oEmbed API endpoint
    ├── services/                # Business logic services
    │   └── Serializer.php      # Content serialization service
    ├── templates/              # Module-specific templates
    └── web/
        └── twig/
            └── GeneralExtension.php # Custom Twig functions and filters
```

### Core Components

#### Main Module Class (`General.php`)
- **Namespace Registration**: Sets up module aliases and controller namespaces
- **Service Registration**: Configures the Serializer service for dependency injection
- **Event Listeners**: Handles Craft CMS events for template roots, asset replacement, and control panel integration
- **Vite Integration**: Loads dashboard-specific JavaScript assets
- **Environment Hooks**: Adds environment-specific CSS classes and development tools

#### Serializer Service (`services/Serializer.php`)
Provides standardized methods for transforming Craft CMS content into frontend-consumable formats:

**Key Methods:**
- `plain()` - Strip HTML tags for plain text output
- `heading()` - Sanitize heading content with allowed tags
- `relatedTo()` - Transform related element collections
- `icon()` - Format Icon Picker field data
- `image()` - Standardize Asset image data
- `video()` - Handle both uploaded and embedded video assets
- `embed()` - Transform EmbeddedAsset data for frontend consumption
- `link()` - Serialize LinkData objects with all attributes

#### Twig Extension (`web/twig/GeneralExtension.php`)
Extends Twig with custom functions and filters for enhanced template capabilities.

📖 **[View Detailed Twig Extension Documentation](general/web/twig/README.md)**

**Global Variables:**
- `screen` - Responsive breakpoint definitions
- `palettes` - Custom color configuration
- `DATE_FORMAT`, `TIME_FORMAT`, `HEADING_TAGS` - Formatting constants

**Custom Functions:**
- `image()` - Advanced image rendering with Imgix optimization
- `src()` - Generate optimized image URLs
- `link()` - Render LinkData objects as HTML
- `svg()` - Inline SVG rendering
- `createLink()` - Programmatically create LinkData objects
- `external()` - Include external file contents
- `swatch()` - Color palette utilities
- `localizations()` - Translation file access

**Custom Filters:**
- `tel` - Format telephone numbers
- `mailto` - Format email addresses
- `plain` - Strip HTML tags
- `media` - Transform media URLs for optimization
- `heading` - Sanitize heading content

#### oEmbed Controller (`controllers/OembedController.php`)
Provides an API endpoint for fetching and serializing external content embeddings:
- **Endpoint**: Accepts POST requests with URL parameter
- **Integration**: Uses `spicyweb/embeddedassets` plugin for content fetching
- **Output**: Returns standardized embed data via Serializer service

## Best Practices

### Following Craft CMS Conventions

This module architecture follows established Craft CMS patterns:

1. **Module Structure**: Standard Craft module organization with proper namespacing
2. **Service Pattern**: Business logic encapsulated in services registered with dependency injection
3. **Event-Driven Architecture**: Leverages Craft's event system for clean integration
4. **Twig Integration**: Extends Twig through proper extension registration
5. **Controller Organization**: Separate controllers for web and console commands

### Code Generation with `craftcms/generator`

Use Craft's built-in generators to maintain consistency when adding new components:

```bash
# Generate new service
ddev craft make service --module=general ServiceName

# Generate new controller
ddev craft make controller --module=general ControllerName

# Generate new Twig extension
ddev craft make twig-extension --module=general ExtensionName

# Generate new console command
ddev craft make command --module=general CommandName

# Generate new queue job
ddev craft make queue-job --module=general JobName
```

### Development Guidelines

**Service Development:**
- Extend `yii\base\Component` for services
- Use static methods for utility functions that don't require state
- Implement proper type hints and return types
- Follow the Serializer pattern for data transformation methods

**Controller Development:**
- Extend `craft\web\Controller` for web controllers
- Use `$allowAnonymous` property to control access
- Implement proper request validation (`requirePostRequest()`, etc.)
- Return JSON responses for API endpoints using `asJson()`

**Twig Extension Development:**
- Implement `GlobalsInterface` for global variables
- Use `HTML_SAFE` constant for functions that return HTML
- Follow naming conventions for functions and filters
- Provide comprehensive parameter validation

**Event Handling:**
- Use Craft's event system for extending core functionality
- Register event listeners in the main module's `init()` method
- Follow proper event naming and handling patterns

### Integration Patterns

**Plugin Integration:**
- Use plugin services through their static `$plugin` property
- Check plugin availability before accessing functionality
- Handle graceful fallbacks when plugins are unavailable

**Frontend Integration:**
- Use the Serializer service to standardize data formats
- Ensure data structures match frontend schema expectations (see `src/lib/schemas.js`)
- Provide consistent API endpoints for AJAX functionality

**Asset Optimization:**
- Leverage environment variables for asset URL transformation
- Implement proper Imgix integration for image optimization
- Handle both local and external asset sources

## Adding New Modules

When creating new modules:

1. **Generate Module Structure:**
   ```bash
   ddev craft make module ModuleName
   ```

2. **Register Module**: Add to `config/app.php` modules array

3. **Follow Naming Conventions**:
   - Use PascalCase for class names
   - Use kebab-case for module IDs
   - Follow PSR-4 autoloading standards

4. **Implement Core Patterns**:
   - Service registration in module `init()`
   - Event listener registration
   - Proper namespace and alias setup

5. **Add Documentation**: Update this README with new module features and patterns

## Development Workflow

### Testing Module Components

```bash
# Test console commands
ddev craft module-name/command-name

# Check module registration
ddev craft modules

# Validate service registration
ddev craft queue/info
```

### Code Quality

All module code follows the project's strict quality standards:

```bash
# PHP formatting
pint modules/
```
