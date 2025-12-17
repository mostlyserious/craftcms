<?php

declare(strict_types=1);

namespace modules\general\services;

use craft\base\Element;
use yii\base\Component;
use craft\elements\Asset;
use craft\fields\data\LinkData;
use verbb\iconpicker\models\Icon;
use modules\general\web\twig\GeneralExtension;
use spicyweb\embeddedassets\models\EmbeddedAsset;
use spicyweb\embeddedassets\Plugin as EmbeddedAssets;

/**
 * Serializer service
 */
class Serializer extends Component
{
    const DATE_FORMAT = 'F j, Y';

    const TIME_FORMAT = 'g:i a';

    const HEADING_TAGS = '<strong><span><em><br><a><i><u>';

    public static function plain(string $string): string
    {
        return mb_trim(strip_tags($string));
    }

    public static function heading(string $heading, ?string $tags = null): string
    {
        if ($tags === null) {
            $tags = static::HEADING_TAGS;
        }

        return mb_trim(strip_tags($heading, $tags));
    }

    /**
     * @return array[]
     */
    public static function relatedTo(Element $element, string $handle = ''): array
    {
        if (isset($element->{$handle})) {
            return array_map(function (Element $element): array {
                return [
                    'uid' => $element->uid,
                    'title' => $element->title,
                    'uri' => $element->uri ? "/{$element->uri}" : '',
                ];
            }, $element->{$handle}->all());
        }

        return [];
    }

    public static function icon(Icon $icon): ?array
    {
        return $icon->value ? [
            'slug' => $icon->label,
            'path' => $icon->value,
            'inline' => GeneralExtension::svg($icon->getDisplayValue() ?: ''),
        ] : null;
    }

    public static function image(?Asset $asset): ?array
    {
        return $asset ? [
            'uid' => $asset->uid,
            'src' => $asset->url,
            'alt' => $asset->label,
            'width' => (int) $asset->width,
            'height' => (int) $asset->height,
            'extension' => $asset->extension,
            'focalPoint' => $asset->focalPoint,
            'hasFocalPoint' => (bool) $asset->hasFocalPoint,
        ] : null;
    }

    public static function video(?Asset $asset): ?array
    {
        if (!$asset) {
            return null;
        }

        if ($asset->mimeType === 'application/json') {
            /** @var ?EmbeddedAsset */
            $embed = EmbeddedAssets::$plugin->methods->getEmbeddedAsset($asset);

            if (!$embed) {
                return null;
            }

            return static::embed($embed);
        }

        return [
            'type' => 'upload',
            'uid' => $asset->uid,
            'title' => $asset->title,
            'slug' => $asset->slug,
            'alt' => $asset->alt,
            'src' => $asset->url,
            'extension' => $asset->extension,
            'mime' => $asset->mimeType,
        ];
    }

    /**
     * @return array<string,mixed>
     */
    public static function embed(EmbeddedAsset $embed): array
    {
        return [
            'type' => 'embed',
            'title' => $embed->title,
            'description' => $embed->description,
            'src' => str_replace('&amp;', '&', $embed->getIframeSrc(['rel=0', 'enablejsapi=1', 'api=1'])),
            'width' => (int) $embed->width,
            'height' => (int) $embed->height,
            'aspectRatio' => (float) $embed->aspectRatio,
            'image' => $embed->image,
            'source' => mb_strtolower($embed->providerName),
        ];
    }

    public static function link(?LinkData $button): ?array
    {
        if (!$button) {
            return null;
        }

        return array_merge([
            'type' => '',
            'text' => $button->getLabel(),
            'url' => $button->getUrl(),
            'label' => null,
            'value' => '',
            'urlSuffix' => null,
            'target' => null,
            'title' => null,
            'class' => null,
            'id' => null,
            'rel' => null,
            'ariaLabel' => null,
            'filename' => null,
            'download' => false,
        ], $button->serialize());
    }
}
