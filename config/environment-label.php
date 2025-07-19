<?php

declare(strict_types=1);

use craft\helpers\App;

return [
    'showLabel' => true,
    'labelText' => App::env('HTTP_HOST'),
    'labelColor' => 'var(--gray-100)',
    'textColor' => 'var(--text-color)',
];
