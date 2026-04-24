<?php

declare(strict_types=1);

namespace modules\general\contracts;

final readonly class EmbedVideoContract
{
    public string $type;

    public function __construct(
        public ?string $title,
        public ?string $description,
        public string $src,
        public int $width,
        public int $height,
        public float $aspectRatio,
        public ?string $image,
        public string $source,
    ) {
        $this->type = 'embed';
    }
}
