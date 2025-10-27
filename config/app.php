<?php

declare(strict_types=1);

use Craft;
use craft\helpers\App;
use modules\general\General;
use diginov\sentrylogger\log\SentryTarget;

return [
    'id' => App::env('CRAFT_APP_ID') ?: 'CraftCMS',
    'modules' => [
        'general' => General::class,
    ],
    'bootstrap' => [
        'general',
    ],
    'components' => [
        'log' => [
            'targets' => [
                // This configuration method adds the Sentry log target to the existing log component before loading any Craft plugins or modules.
                // This way we are assured that all logs are sent to Sentry.
                'sentry' => function (): ?object {
                    if (!App::env('SENTRY_DSN')) {
                        return null;
                    }

                    if (!class_exists(SentryTarget::class)) {
                        Craft::warning('SentryTarget class not found. Sentry logging disabled.');

                        return null;
                    }

                    return Craft::createObject([
                        'class' => SentryTarget::class,
                        'enabled' => App::env('CRAFT_ENVIRONMENT') !== 'dev',
                        'environment' => App::env('CRAFT_ENVIRONMENT'),
                        'dsn' => App::env('SENTRY_DSN'),
                        'exceptCodes' => [400, 403, 404, 429],
                        'levels' => ['error', 'warning'],
                        'exceptPatterns' => [],
                        'release' => null,
                        'anonymous' => false,
                        'userPrivacy' => ['id', 'email', 'username', 'ip_address', 'cookies', 'permissions'],
                    ]);
                },
            ],
        ],
    ],
];
