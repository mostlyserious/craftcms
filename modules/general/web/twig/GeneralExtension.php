<?php

declare(strict_types=1);

namespace modules\general\web\twig;

use Craft;
use Twig\Markup;
use Stringy\Stringy;
use Twig\TwigFilter;
use craft\helpers\App;
use Twig\TwigFunction;
use craft\helpers\Html;
use craft\elements\Asset;
use craft\helpers\Template;
use craft\fields\data\LinkData;
use craft\helpers\StringHelper;
use Illuminate\Support\Collection;
use Twig\Extension\GlobalsInterface;
use Twig\Extension\AbstractExtension;
use modules\general\services\Serializer;
use craft\fields\linktypes\Sms as SmsLink;
use craft\fields\linktypes\Url as UrlLink;
use craft\fields\linktypes\Asset as AssetLink;
use craft\fields\linktypes\Email as EmailLink;
use craft\fields\linktypes\Entry as EntryLink;
use craft\fields\linktypes\Phone as PhoneLink;
use craft\fields\linktypes\Category as CategoryLink;

/**
 * Twig extension
 */
class GeneralExtension extends AbstractExtension implements GlobalsInterface
{
    const HTML_SAFE = ['is_safe' => ['html']];

    const IMGIX_DEFAULTS = ['auto' => 'format,compress'];

    const LINK_ATTRS = [
        'label',
        'urlSuffix',
        'target',
        'title',
        'class',
        'id',
        'rel',
        'ariaLabel',
        'download',
    ];

    const LINK_TYPES = [
        'category' => CategoryLink::class,
        'asset' => AssetLink::class,
        'email' => EmailLink::class,
        'entry' => EntryLink::class,
        'phone' => PhoneLink::class,
        'sms' => SmsLink::class,
        'url' => UrlLink::class,
    ];

    private static $instance;

    public function getGlobals(): array
    {
        return [
            'DATE_FORMAT' => Serializer::DATE_FORMAT,
            'TIME_FORMAT' => Serializer::TIME_FORMAT,
            'HEADING_TAGS' => Serializer::HEADING_TAGS,
            'palettes' => Craft::$app->config->custom->colors,
            'screen' => [
                '2xs' => '24rem', // custom
                'xs' => '32rem',  // custom
                'sm' => '40rem',  // TailwindCSS default
                'md' => '48rem',  // TailwindCSS default
                'lg' => '64rem',  // TailwindCSS default
                'xl' => '80rem',  // TailwindCSS default
                '2xl' => '96rem', // TailwindCSS default
            ],
        ];
    }

    public function getFilters(): array
    {
        return [
            new TwigFilter('tel', [static::class, 'tel']),
            new TwigFilter('mailto', [static::class, 'mailto']),
            new TwigFilter('plain', [static::class, 'plain']),
            new TwigFilter('media', [static::class, 'media'], static::HTML_SAFE),
            new TwigFilter('heading', [static::class, 'heading'], static::HTML_SAFE),
            new TwigFilter('onlyEnv', [static::class, 'onlyEnv'], static::HTML_SAFE),
        ];
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('src', [static::class, 'src']),
            new TwigFunction('stringy', [static::class, 'stringy']),
            new TwigFunction('createLink', [static::class, 'createLink']),
            new TwigFunction('svg', [static::class, 'svg'], static::HTML_SAFE),
            new TwigFunction('link', [static::class, 'link'], static::HTML_SAFE),
            new TwigFunction('image', [static::class, 'image'], static::HTML_SAFE),
            new TwigFunction('swatch', function (Collection $palette, ...$keys): string {
                return mb_trim($palette->only($keys)->implode(' '));
            }),
            new TwigFunction('localizations', function ($lang = '*', $domain = '*', $flatten = false): ?array {
                $translations = [];
                $files = glob(sprintf('%s/translations/%s/%s.php', CRAFT_BASE_PATH, $lang, $domain)) ?? [];

                foreach ($files as $file) {
                    $list = require $file;

                    if (!$flatten && ($domain === '*' || $lang === '*')) {
                        $key = $domain === '*'
                            ? mb_trim(basename($file), '.php')
                            : basename(dirname($file));

                        $list = [$key => $list];
                    }

                    $translations = array_merge($translations, $list);
                }

                return count($translations) ? $translations : null;
            }),
        ];
    }

    public static function stringy(string $string): Stringy
    {
        return Stringy::create($string);
    }

    public static function media(string $string, int $width): string
    {
        $srcset = sprintf('srcset="{}?auto=compress,format&width=%d, {}?auto=compress,format&width=%d 2x"', $width, $width * 2);

        return preg_replace_callback('/src="([^"]+)"/m', function (array $matches) use ($srcset): string {
            return str_replace(
                App::env('OBJECT_STORAGE_URL'),
                App::env('IMGIX_URL'),
                str_replace('{}', $matches[1], $srcset),
            );
        }, $string);
    }

    /**
     * @param array<string,mixed>            $args
     * @param array<string,array<int,mixed>> $sources
     * @param 'lazy'|'eager'                 $loading
     * */
    public static function image(?Asset $asset = null, array $args = [], array $sources = [], string $loading = 'lazy', string $tag = 'img'): string
    {
        if ($asset === null) {
            return '';
        }

        $assets_url = App::env('IMGIX_URL');
        $base_url = App::env('OBJECT_STORAGE_URL');

        $width = $args['width'] ?? '';
        $height = $args['height'] ?? '';

        $width = intval(str_replace(',', '', strval($width)));
        $height = intval(str_replace(',', '', strval($height)));

        $args = array_filter($args);

        if (isset($asset->focalPoint)) {
            $args = array_merge($args, [
                'fp-x' => $asset->focalPoint['x'],
                'fp-y' => $asset->focalPoint['y'],
            ]);
        }

        $args = array_merge(static::IMGIX_DEFAULTS, $args, [
            'crop' => $asset->hasFocalPoint ? 'focalpoint' : ($args['crop'] ?? 'faces,center'),
        ]);

        if ($assets_url) {
            $image = [
                'url' => str_replace($base_url ?: '', $assets_url, $asset->url) . '?' . http_build_query($args),
            ];

            $image2x = [
                'url' => str_replace($base_url ?: '', $assets_url, $asset->url) . '?' . http_build_query(array_merge($args, [
                    'width' => isset($args['width']) ? $args['width'] * 2 : null,
                    'height' => isset($args['height']) ? $args['height'] * 2 : null,
                ])),
            ];
        } else {
            $image = ['url' => $asset->url];
            $image2x = ['url' => $asset->url];
        }

        if (!$width && $height && isset($asset->height)) {
            $width = number_format(min($asset->height, $height) * ($asset->width / $asset->height));
        }

        if (!$height && $width && isset($asset->width)) {
            $height = number_format(min($asset->width, $width) * ($asset->height / $asset->width));
        }

        $width = $width ? $width : $asset->width;
        $height = $height ? $height : $asset->height;

        $url = ($asset->extension === 'gif' ? explode('?', $image['url'])[0] : $image['url']);
        $url2x = ($asset->extension === 'gif' ? explode('?', $image2x['url'])[0] : $image2x['url']);

        if (!in_array($loading, ['lazy', 'eager'])) {
            $loading = 'lazy';
        }

        $attrs = [
            'width' => str_replace(',', '', strval($width)),
            'height' => str_replace(',', '', strval($height)),
            'src' => 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
            'srcset' => implode(', ', [$url, "{$url2x} 2x"]),
            'alt' => $asset->alt ?? '',
            'loading' => $loading,
        ];

        if ($loading === 'eager' && empty($sources)) {
            header(sprintf('Link: <%s>; as=image; rel=preload;', $url2x));
        }

        if (count($sources)) {
            ksort($sources, SORT_NUMERIC);
            $sources = array_reverse($sources, true);

            return Html::tag('picture', implode(PHP_EOL, array_merge(array_map(function (array $source, string $breakpoint) use ($asset): string {
                static $prev_breakpoint = null;

                $markup = static::image($asset, $source, [], 'lazy', 'source');
                $markup = Html::modifyTagAttributes($markup, [
                    'media' => $prev_breakpoint
                        ? sprintf('(min-width: %s) and (max-width: %s)', $breakpoint, sprintf('calc(%s - 1px)', $prev_breakpoint))
                        : sprintf('(min-width: %s)', $breakpoint),
                ]);

                $prev_breakpoint = $breakpoint;

                return $markup;
            }, $sources, array_keys($sources)), [
                Html::tag($tag, '', $attrs),
            ])));
        }

        if ($tag === 'source') {
            unset($attrs['src'], $attrs['alt'], $attrs['loading']);
        } else {
            $attrs = array_merge([
                'style' => 'opacity:0',
                'onload' => '!this.hasAttribute("data-animate") ? this.removeAttribute("style") : null, this.removeAttribute("onload")',
            ], $attrs);
        }

        return Html::tag($tag, '', $attrs);
    }

    /** @param array<string,mixed> $args */
    public static function src(?Asset $asset = null, array $args = []): string
    {
        if ($asset === null) {
            return '';
        }

        $assets_url = App::env('IMGIX_URL');
        $base_url = App::env('OBJECT_STORAGE_URL');

        $width = $args['width'] ?? '';
        $height = $args['height'] ?? '';

        $width = str_replace(',', '', strval($width));
        $height = str_replace(',', '', strval($height));

        $args = array_filter($args);

        if (isset($asset->focalPoint)) {
            $args = array_merge($args, [
                'fp-x' => $asset->focalPoint['x'],
                'fp-y' => $asset->focalPoint['y'],
            ]);
        }

        $args = array_merge(static::IMGIX_DEFAULTS, $args, [
            'crop' => $asset->hasFocalPoint ? 'focalpoint' : ($args['crop'] ?? 'faces,center'),
        ]);

        $url = $assets_url
            ? str_replace($base_url ?: '', $assets_url, $asset->url) . '?' . http_build_query($args)
            : $asset->url;

        return $asset->extension === 'gif' ? explode('?', $url)[0] : $url;
    }

    public static function svg(Asset|string $svg, ?bool $sanitize = true, ?bool $namespace = null, bool $throw_exception = false): string
    {
        return Html::svg($svg, $sanitize, $namespace, $throw_exception);
    }

    public static function createLink(string|int $value, string $type = 'url'): LinkData
    {
        if (isset(self::LINK_TYPES[$type])) {
            $type = self::LINK_TYPES[$type];
        }

        $link_type = new $type();

        return new LinkData((string) $link_type->normalizeValue($value), $link_type, []);
    }

    /** @param array<string,mixed> $args */
    public static function link(?LinkData $button, array $args = [], string $wrap = ''): Markup
    {
        if (!$button) {
            return Template::raw('');
        }

        $attributes = array_intersect_key($args, array_flip(self::LINK_ATTRS));
        $ends = array_intersect_key($args, array_flip(['prepend', 'append']));
        $args = array_diff_key($args, array_flip(array_merge(self::LINK_ATTRS, array_keys($ends))));

        foreach ($attributes as $attribute => $value) {
            $method = sprintf('set%s', StringHelper::toPascalCase($attribute));

            if (method_exists($button, $method)) {
                $button->$method($value);
            } else {
                $button->$attribute = $value;
            }
        }

        foreach ($ends as $kind => $value) {
            $text = $button->getLabel();

            if ($kind === 'prepend') {
                $button->setLabel(implode(' ', [$value, $text]));
            } elseif ($kind === 'append') {
                $button->setLabel(implode(' ', [$text, $value]));
            }
        }

        $url = $button->getUrl();
        $label = $button->getLabel();

        $markup = Html::a($label ? $label : $url, $url, array_merge([
            'id' => $button->id,
            'class' => $button->class,
            'target' => $button->target,
            'aria-label' => $button->ariaLabel,
            'title' => $button->title,
            'rel' => $button->rel,
            'download' => $button->download
                ? ($button->filename ?? true)
                : false,
        ], $args));

        return Template::raw($wrap
            ? sprintf('<%1$s>%2$s</%1$s>', $wrap, $markup)
            : $markup);
    }

    /**
     * @param string|string[] $environments
     */
    public static function onlyEnv(?string $markup, string|array $environments): string
    {
        $markup = mb_trim($markup ?: '');

        if (!$markup) {
            return '';
        }

        if (!is_array($environments)) {
            $environments = [$environments];
        }

        if (in_array(Craft::$app->config->env, $environments)) {
            return $markup;
        }

        return sprintf('<template> %s </template>', $markup);
    }

    public static function plain(mixed $string): string
    {
        if ($string === null) {
            return '';
        }

        return Serializer::plain(strval($string));
    }

    public static function heading(mixed $string): string
    {
        if ($string === null) {
            return '';
        }

        return Serializer::heading(strval($string));
    }

    public static function tel(string $string): string
    {
        return preg_replace_callback('/((?:1[^\d]?)?\(?\d{3}\)?[^\d]?\d{3}[^\d]?\d{4})/', function ($matches) {
            $tel = $matches[1];
            $tel = preg_replace('/\D/', '', $tel);
            $tel = preg_replace('/^1/', '+1', $tel);

            return sprintf('tel:%s', $tel);
        }, $string);
    }

    public static function mailto(string $string): string
    {
        return sprintf('mailto:%s', mb_strtolower(filter_var($string, FILTER_SANITIZE_EMAIL)));
    }

    public static function instance(): self
    {
        if (!self::$instance) {
            self::$instance = new self();
        }

        return self::$instance;
    }
}
