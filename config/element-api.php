<?php

declare(strict_types=1);

use Craft;
use craft\elements\Entry;

return [
    'defaults' => [
        'cache' => Craft::$app->config->env !== 'dev'
            ? Craft::$app->config->general->cacheDuration
            : false,
    ],
    'endpoints' => [
        'api/ping' => function (): array {
            return [
                'one' => true,
                'elementType' => Entry::class,
                'transformer' => function (): array {
                    return [
                        'success' => true,
                    ];
                },
            ];
        },
    ],
];
