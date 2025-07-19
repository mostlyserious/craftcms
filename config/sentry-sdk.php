<?php

declare(strict_types=1);

use craft\helpers\App;

return [
    '*' => [
        'enabled' => false,
        'anonymous' => false,
        'clientDsn' => App::env('SENTRY_DSN'),
        'excludedCodes' => ['400', '404', '429'],
        'release' => null,
    ],
    'production' => [
        'enabled' => (bool) App::env('SENTRY_DSN'),
    ],
];
