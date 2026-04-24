<?php

declare(strict_types=1);

use craft\elements\Entry;
use craft\web\Application as WebApplication;
use craft\console\Application as ConsoleApplication;

/** @var WebApplication|ConsoleApplication $app */
$app = Craft::$app;

return [
    'defaults' => [
        'cache' => $app->getConfig()->env !== 'dev'
            ? $app->getConfig()->general->cacheDuration
            : false,
    ],
    'endpoints' => [
        'api/ping' => fn (): array => [
            'one' => true,
            'elementType' => Entry::class,
            'transformer' => fn (): array => ['success' => true],
        ],
    ],
];
