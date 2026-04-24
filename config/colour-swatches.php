<?php

declare(strict_types=1);

use Illuminate\Support\Collection;
use craft\web\Application as WebApplication;
use craft\console\Application as ConsoleApplication;

/**
 * You should mostly never need to edit this file directly.
 * Colors are mapped from `custom.php` to a schema for the color swatches field here.
 */

/** @var WebApplication|ConsoleApplication $app */
$app = Craft::$app;
$custom = get_object_vars($app->getConfig()->custom);
/** @var array<string,array<string,Collection<string,mixed>>> $colors */
$colors = $custom['colors'] ?? [];
$palettes = [];

foreach ($colors as $key => $swatches) {
    $palettes[$key] = [];
    $i = 0;

    foreach ($swatches as $handle => $swatch) {
        $preview = $swatch->get('preview');

        $palettes[$key][] = [
            'label' => $handle,
            'default' => !$i,
            'color' => is_array($preview)
                ? array_map(fn (mixed $color): array => ['color' => is_scalar($color) ? (string) $color : ''], $preview)
                : [$swatch->only(['color'])->all()],
        ];

        $i++;
    }
}

return [
    'palettes' => $palettes,
];
