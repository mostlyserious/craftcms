<?php

declare(strict_types=1);

namespace modules\general\contracts;

final readonly class UploadVideoContract
{
    public string $type;

    public function __construct(
        public ?string $uid,
        public ?string $title,
        public ?string $slug,
        public ?string $alt,
        public ?string $src,
        public ?string $extension,
        public ?string $mime,
    ) {
        $this->type = 'upload';
    }
}
