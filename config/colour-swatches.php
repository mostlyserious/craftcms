<?php

declare(strict_types=1);

use Craft;
use Illuminate\Support\Collection;

/**
 * You should mostly never need to edit this file directly.
 * Colors are mapped from `custom.php` to a schema for the color swatches field here.
 */

 return [
    'palettes' => Collection::make(Craft::$app->config->custom->colors)->mapWithKeys(fn (array $swatches, string $key): array => [
        $key => array_map(fn (Collection $swatch, string $handle, int $i): array => [
            'label' => $handle,
            'default' => !$i,
            'color' => $swatch->has('preview')
                ? array_map(fn (string $color) => ['color' => $color], $swatch->get('preview'))
                : [$swatch->only(['color'])->all()],
        ], $swatches, array_keys($swatches), Collection::make()->range(0, count($swatches) - 1)->all()),
    ])->all(),
];
