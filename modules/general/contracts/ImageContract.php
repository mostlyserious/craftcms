<?php

declare(strict_types=1);

namespace modules\general\contracts;

final readonly class ImageContract
{
    public function __construct(
        public ?string $uid,
        public ?string $src,
        public string $alt,
        public int $width,
        public int $height,
        public ?string $extension,
        public bool $hasFocalPoint,
        public FocalPointContract $focalPoint,
    ) {}
}
