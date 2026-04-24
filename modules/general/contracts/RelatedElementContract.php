<?php

declare(strict_types=1);

namespace modules\general\contracts;

final readonly class RelatedElementContract
{
    public function __construct(
        public ?string $uid,
        public ?string $title,
        public string $uri,
    ) {}
}
