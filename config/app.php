<?php

declare(strict_types=1);

use craft\helpers\App;
use modules\general\General;

return [
    'id' => App::env('CRAFT_APP_ID') ?: 'CraftCMS',
    'modules' => [
        'general' => General::class,
    ],
    'bootstrap' => [
        'general',
    ],
];
