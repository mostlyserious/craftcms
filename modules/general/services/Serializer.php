<?php

declare(strict_types=1);

namespace modules\general\services;

use craft\base\Element;
use yii\base\Component;
use craft\elements\Asset;
use craft\fields\data\LinkData;
use verbb\iconpicker\models\Icon;
use modules\general\contracts\IconContract;
use modules\general\contracts\LinkContract;
use craft\elements\db\ElementQueryInterface;
use modules\general\contracts\ImageContract;
use modules\general\web\twig\GeneralExtension;
use modules\general\contracts\EmbedVideoContract;
use modules\general\contracts\FocalPointContract;
use spicyweb\embeddedassets\models\EmbeddedAsset;
use modules\general\contracts\UploadVideoContract;
use modules\general\contracts\RelatedElementContract;
use spicyweb\embeddedassets\Plugin as EmbeddedAssets;
use modules\general\contracts\RelatedElementCollection;

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

    public static function relatedTo(Element $element, string $handle = ''): RelatedElementCollection
    {
        if (isset($element->{$handle}) && $element->{$handle} instanceof ElementQueryInterface) {
            return new RelatedElementCollection(...array_values(array_filter(array_map(function (mixed $element): ?RelatedElementContract {
                if (!$element instanceof Element) {
                    return null;
                }

                return new RelatedElementContract(
                    uid: $element->uid,
                    title: $element->title,
                    uri: $element->uri ? "/{$element->uri}" : '',
                );
            }, $element->{$handle}->all()))));
        }

        return new RelatedElementCollection();
    }

    public static function icon(Icon $icon): ?IconContract
    {
        return $icon->value ? new IconContract(
            slug: $icon->label,
            path: $icon->value,
            inline: GeneralExtension::svg($icon->getDisplayValue() ?: ''),
        ) : null;
    }

    public static function image(?Asset $asset): ?ImageContract
    {
        return $asset ? new ImageContract(
            uid: $asset->uid,
            src: $asset->url,
            alt: $asset->alt ?? '',
            width: (int) $asset->width,
            height: (int) $asset->height,
            extension: $asset->extension,
            hasFocalPoint: (bool) $asset->hasFocalPoint,
            focalPoint: is_array($asset->focalPoint) && isset($asset->focalPoint['x'], $asset->focalPoint['y'])
                ? new FocalPointContract(
                    x: (float) $asset->focalPoint['x'],
                    y: (float) $asset->focalPoint['y'],
                )
                : new FocalPointContract(x: 0.5, y: 0.5),
        ) : null;
    }

    public static function video(?Asset $asset): UploadVideoContract|EmbedVideoContract|null
    {
        if (!$asset) {
            return null;
        }

        if ($asset->mimeType === 'application/json') {
            $embed = EmbeddedAssets::$plugin?->methods->getEmbeddedAsset($asset);

            if (!$embed) {
                return null;
            }

            return static::embed($embed);
        }

        return new UploadVideoContract(
            uid: $asset->uid,
            title: $asset->title,
            slug: $asset->slug,
            alt: $asset->alt,
            src: $asset->url,
            extension: $asset->extension,
            mime: $asset->mimeType,
        );
    }

    public static function embed(EmbeddedAsset $embed): EmbedVideoContract
    {
        return new EmbedVideoContract(
            title: $embed->title,
            description: $embed->description,
            src: str_replace('&amp;', '&', $embed->getIframeSrc(['rel=0', 'enablejsapi=1', 'api=1'])),
            width: (int) $embed->width,
            height: (int) $embed->height,
            aspectRatio: (float) $embed->aspectRatio,
            image: $embed->image,
            source: mb_strtolower($embed->providerName),
        );
    }

    public static function link(?LinkData $button): ?LinkContract
    {
        if (!$button) {
            return null;
        }

        $serialized = $button->serialize();

        $data = array_merge([
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
        ], is_array($serialized) ? $serialized : []);

        return new LinkContract(
            type: self::string($data['type']),
            text: self::nullableString($data['text']),
            url: self::string($data['url']),
            label: self::nullableString($data['label']),
            value: self::string($data['value']),
            urlSuffix: self::nullableString($data['urlSuffix']),
            target: self::nullableString($data['target']),
            title: self::nullableString($data['title']),
            class: self::nullableString($data['class']),
            id: self::nullableString($data['id']),
            rel: self::nullableString($data['rel']),
            ariaLabel: self::nullableString($data['ariaLabel']),
            filename: self::nullableString($data['filename']),
            download: $data['download'] === true,
        );
    }

    private static function string(mixed $value): string
    {
        return is_string($value) ? $value : '';
    }

    private static function nullableString(mixed $value): ?string
    {
        return is_string($value) ? $value : null;
    }
}
