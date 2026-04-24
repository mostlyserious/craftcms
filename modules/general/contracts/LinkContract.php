<?php

declare(strict_types=1);

namespace modules\general\contracts;

final readonly class LinkContract
{
    public function __construct(
        public string $type,
        public ?string $text,
        public string $url,
        public ?string $label,
        public string $value,
        public ?string $urlSuffix,
        public ?string $target,
        public ?string $title,
        public ?string $class,
        public ?string $id,
        public ?string $rel,
        public ?string $ariaLabel,
        public ?string $filename,
        public bool $download,
    ) {}
}
