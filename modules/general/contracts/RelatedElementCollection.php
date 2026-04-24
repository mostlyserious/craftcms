<?php

declare(strict_types=1);

namespace modules\general\contracts;

use Countable;
use ArrayIterator;
use JsonSerializable;
use IteratorAggregate;

/**
 * @implements IteratorAggregate<int, RelatedElementContract>
 */
final readonly class RelatedElementCollection implements Countable, IteratorAggregate, JsonSerializable
{
    /**
     * @var array<int, RelatedElementContract>
     */
    private array $items;

    public function __construct(RelatedElementContract ...$items)
    {
        $this->items = array_values($items);
    }

    public function count(): int
    {
        return count($this->items);
    }

    /**
     * @return ArrayIterator<int, RelatedElementContract>
     */
    public function getIterator(): ArrayIterator
    {
        return new ArrayIterator($this->items);
    }

    /**
     * @return array<int, RelatedElementContract>
     */
    public function jsonSerialize(): array
    {
        return $this->items;
    }
}
