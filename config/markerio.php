<?php

declare(strict_types=1);

use craft\helpers\App;

return [
    'project' => App::env('MARKERIO_PROJECT'),
    'requireLogin' => App::env('CRAFT_ENVIRONMENT') === 'production',
    'enableWidgetFe' => true,
    'enableWidgetCp' => true,
];
