<?php

declare(strict_types=1);

namespace modules\general\contracts;

final readonly class FocalPointContract
{
    public function __construct(
        public float $x,
        public float $y,
    ) {}
}
