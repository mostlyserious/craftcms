<?php

declare(strict_types=1);

namespace modules\general\contracts;

final readonly class IconContract
{
    public function __construct(
        public ?string $slug,
        public string $path,
        public string $inline,
    ) {}
}
