# Utility Scripts and Modules

This directory contains utility scripts and modules that support the Craft CMS development workflow. These utilities handle environment configuration, project setup, and asset optimization.

## Core Utilities

### `env.js` - Environment Configuration Parser

A robust environment variable parser and validator built with Zod schema validation. This module ensures that all required environment variables are present and properly formatted.

#### Key Features

- **Schema Validation**: Uses Zod to define and validate environment variable types
- **Type Coercion**: Automatically converts string values to appropriate types (numbers, booleans, etc.)
- **Graceful Error Handling**: Exits with clear error messages if validation fails
- **Default Values**: Provides sensible defaults for optional variables

#### Usage

```javascript
import { parse } from './utility/env.js'

// Parse and validate current environment
const { VITE_BASE, VITE_PORT, PRIMARY_SITE_URL } = env.parse()

// Parse and validate custom environment object
const { VITE_BASE, VITE_PORT, PRIMARY_SITE_URL } = env.parse(customEnvObject)
```

#### Environment Variables

The schema validates the following environment variables:

**Vite Configuration**:

- `VITE_BASE` (required): Base URL for Vite
- `VITE_TEMP` (optional): Temporary directory path
- `VITE_PORT` (default: 5173): Development server port

**External Services**:

- `TINYPNG_KEY` (required): API key for TinyPNG image optimization

**Craft CMS Configuration**:

- `CRAFT_ENVIRONMENT` (required): Environment type (dev/staging/production)
- `CRAFT_SECURITY_KEY` (required): Craft security key
- `CRAFT_APP_ID` (required): Craft application ID
- `PRIMARY_SITE_NAME` (required): Primary site name
- `PRIMARY_SITE_URL` (required): Primary site URL (must be valid URL)
- `CRAFT_ENABLE_TEMPLATE_CACHING` (optional): Enable template caching

**Database Configuration**:

- `CRAFT_DB_DRIVER` (required): Database driver
- `CRAFT_DB_SERVER` (required): Database server
- `CRAFT_DB_USER` (required): Database username
- `CRAFT_DB_PASSWORD` (required): Database password
- `CRAFT_DB_DATABASE` (required): Database name
- `CRAFT_DB_SCHEMA` (required): Database schema
- `CRAFT_DB_TABLE_PREFIX` (optional): Table prefix
- `CRAFT_DB_PORT` (default: 3306): Database port

**Email Configuration**:

- `SYSTEM_EMAIL_TEST_ADDRESS` (optional): Test email address
- `SYSTEM_EMAIL_ADDRESS` (required): System email address

### `install.sh` - Project Setup Script

An automated setup script that initializes a new Craft CMS project with all necessary dependencies and configuration. This script streamlines the development environment setup process.

#### What It Does

1. **Environment Setup**:
    - Copies `.env.example` to `.env`
    - Automatically configures `PRIMARY_SITE_URL` based on current directory name
    - Sets up `IMGIX_URL` for image optimization service with a sensible default

2. **DDEV Configuration**:
    - Configures DDEV project with directory-based naming
    - Starts the DDEV environment
    - Updates Composer dependencies
    - Runs `bun install` on the host and lets the Bun postinstall hook refresh container dependencies automatically when DDEV is running
    - Uses DDEV configuration that keeps container `node_modules` separate from the host tree

3. **Craft CMS Installation**:
    - Generates security keys
    - Runs Craft installation process
    - Uses the host install as the standard JavaScript dependency step for IDEs and local tooling

4. **API Key Integration** (if 1Password CLI is available):
    - Retrieves API keys from 1Password vault
    - Automatically configures `TINYPNG_KEY`
    - Triggers initial build process

5. **Fallback Handling**:
    - Provides helpful instructions if 1Password CLI is not installed
    - Continues setup process without API keys
    - Keeps manual container refresh available via `ddev bun install` if the background sync is skipped or needs to be rerun later

#### Prerequisites

- DDEV installed and configured
- Bun package manager
- Composer
- 1Password CLI (optional, for automatic API key setup)

#### 1Password CLI Integration

The install script includes automatic API key retrieval using the 1Password CLI for a streamlined development setup experience. This integration eliminates the need to manually copy and paste API keys from the 1Password vault.

**Requirements:**

- 1Password CLI installed and authenticated
- Access to the Mostly Serious team account (`mostlyserious.1password.com`)
- Read access to the default `Employee` vault
- An item named `ENVIRONMENT_DEFAULTS` with the required API key fields
- Field with label `TINYPNG_KEY` containing the TinyPNG API key

**Installation Process:**

1. If 1Password CLI is detected, the script automatically retrieves and sets the API keys
2. After setting the keys, it runs `bun run build` to perform the initial asset build inside DDEV
3. If 1Password CLI is not available, the script provides installation instructions and continues without the API keys

#### JavaScript Dependency Model

This template supports two valid JavaScript install contexts from the same `package.json` and `bun.lock`:

- `bun install` on the host as the standard dependency-management path
- `ddev bun install` as a manual recovery command when you need to prune and refresh container dependencies explicitly

When DDEV is running, host `bun install`, `bun update`, `bun add`, and `bun remove` schedule an asynchronous background sync that waits for `package.json` and `bun.lock` to settle, runs `ddev mutagen sync`, prunes the container `node_modules` volume, and then runs `ddev bun install --frozen-lockfile`.

These installs are expected to be separate platform-specific `node_modules` trees. The project does not require a shared host/container dependency directory.

The DDEV configuration supports this by excluding `/node_modules` from Mutagen sync and by mounting container-side `node_modules` on its own Docker volume.

**Benefits:**

- Eliminates manual API key configuration
- Ensures consistent key management across team members
- Reduces setup friction for new developers
- Maintains security by keeping API keys in the team vault

**Installing 1Password CLI:**
If you don't have the 1Password CLI installed, visit: https://developer.1password.com/docs/cli/get-started/

## Asset Optimization Plugins

### `vite-plugin-svgo.js`

A Vite plugin that automatically optimizes SVG files during the build process using SVGO. Reduces file sizes while maintaining visual quality.

### `vite-plugin-tinify.js`

A Vite plugin that compresses PNG and JPEG images using the TinyPNG service. Features intelligent caching to avoid reprocessing unchanged images and requires a `TINYPNG_KEY` environment variable.
