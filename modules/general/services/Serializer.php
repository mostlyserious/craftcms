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

    /** Tags that end a line, so the text on either side doesn't run together once stripped. */
    const LINE_BREAK_TAGS = '~<(?:br|/?(?:p|div|li|h[1-6]|blockquote|figcaption|td|th))\b[^>]*>~i';

    /** Whitespace and line breaks that only pad the ends of a heading. */
    const HEADING_PADDING = '~^(?:[\s\p{Z}]|&nbsp;|&#160;|<br\s*/?>)+|(?:[\s\p{Z}]|&nbsp;|&#160;|<br\s*/?>)+$~iu';

    /** Tags that are content without text: images, media embeds, and stored nested entries. */
    const EMBED_TAGS = '~<(?:img|picture|svg|video|audio|iframe|embed|object|oembed|craft-entry)\b~i';

    /**
     * The visible text of an HTML string. Entities are decoded, and whitespace,
     * including non-breaking spaces, is collapsed and trimmed. Print it escaped.
     */
    public static function plain(string $string): string
    {
        $text = html_entity_decode(strip_tags(preg_replace(static::LINE_BREAK_TAGS, ' ', $string) ?? $string), ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/[\x{200B}-\x{200D}\x{2060}\x{FEFF}]/u', '', $text) ?? $text;

        return mb_trim(preg_replace('/[\s\p{Z}]+/u', ' ', $text) ?? $text);
    }

    /**
     * Whether an HTML string has visible text or embedded content, such as an
     * image or media embed with no text around it.
     */
    public static function filled(string $string): bool
    {
        return static::plain($string) !== '' || preg_match(static::EMBED_TAGS, $string) === 1;
    }

    /**
     * A heading's inline markup, or an empty string when it has no visible text.
     * Paragraphs become line breaks, so their words don't run together, and
     * whitespace and line breaks at either end are trimmed.
     */
    public static function heading(string $heading, ?string $tags = null): string
    {
        if ($tags === null) {
            $tags = static::HEADING_TAGS;
        }

        $heading = preg_replace('~</p>\s*<p(?:\s[^>]*)?>~i', '<br>', $heading) ?? $heading;

        if (static::plain($heading) === '') {
            return '';
        }

        $heading = strip_tags($heading, $tags);

        return preg_replace(static::HEADING_PADDING, '', $heading) ?? mb_trim($heading);
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
