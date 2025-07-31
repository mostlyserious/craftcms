<?php

declare(strict_types=1);

use Illuminate\Support\Collection;

return [
    'fonts' => [
        // 'google' => '',
        // 'adobe' => '',
    ],
    // you must also update `src/lib/stores/schemas.js` when you add/edit values here.
    'colors' => [
        'background' => [
            'default' => Collection::make([
                'color' => 'var(--color-white)',
                'background' => '',
                'text' => '',
            ]),
            'lightGray' => Collection::make([
                'color' => 'var(--color-neutral-100)',
                'background' => 'bg-neutral-100',
                'text' => '',
            ]),
        ],
        'misc' => [
            'footer' => Collection::make([
                'color' => 'var(--color-neutral-800)',
                'background' => 'bg-neutral-800',
                'text' => 'text-white',
            ]),
        ],
    ],
];
