<?php

declare(strict_types=1);

use Illuminate\Support\Collection;

return [
    'fonts' => [
        // 'google' => '',
        // 'adobe' => '',
    ],
    // it's very helpful to update `src/env.d.ts` too when you add values here.
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
