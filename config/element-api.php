<?php

declare(strict_types=1);

use Craft;

return [
    'defaults' => [
        'cache' => Craft::$app->config->env !== 'dev'
            ? Craft::$app->config->general->cacheDuration
            : false,
    ],
    'endpoints' => [

    ],
];
