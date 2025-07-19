<?php

declare(strict_types=1);

use Craft;

return [
    'defaults' => [
        'cache' => Craft::$app->config->cacheDuration !== 'dev'
            ? Craft::$app->config->general->cacheDuration
            : false,
    ],
    'endpoints' => [

    ],
];
