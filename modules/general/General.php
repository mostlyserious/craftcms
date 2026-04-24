<?php

declare(strict_types=1);

namespace modules\general;

use Craft;
use craft\web\View;
use yii\base\Event;
use yii\base\Module;
use craft\helpers\App;
use GuzzleHttp\Client;
use craft\elements\Asset;
use craft\services\Assets;
use nystudio107\vite\Vite;
use craft\helpers\StringHelper;
use craft\base\Event as CraftEvent;
use craft\events\ReplaceAssetEvent;
use craft\web\Request as WebRequest;
use modules\general\services\Serializer;
use craft\web\twig\variables\CraftVariable;
use craft\console\Request as ConsoleRequest;
use craft\events\RegisterTemplateRootsEvent;
use craft\web\Application as WebApplication;
use modules\general\web\twig\GeneralExtension;
use craft\console\Application as ConsoleApplication;

/**
 * @property-read Serializer $serializer
 */
class General extends Module
{
    public function init(): void
    {
        Craft::setAlias('@modules/general', __DIR__);

        /** @var WebApplication|ConsoleApplication $app */
        $app = Craft::$app;
        /** @var WebRequest|ConsoleRequest $request */
        $request = $app->getRequest();
        /** @var View $view */
        $view = $app->getView();

        if ($request->getIsConsoleRequest()) {
            $this->controllerNamespace = 'modules\\general\\console\\controllers';
        } else {
            $this->controllerNamespace = 'modules\\general\\controllers';
        }

        parent::init();

        $view->registerTwigExtension(GeneralExtension::instance());

        $app->onInit(function (): void {
            $this->setComponents([
                'serializer' => Serializer::class,
            ]);
        });

        Event::on(
            CraftVariable::class,
            CraftVariable::EVENT_INIT,
            function (Event $event): void {
                if ($event->sender instanceof CraftVariable) {
                    $event->sender->set('serializer', Serializer::class);
                }
            },
        );

        Event::on(
            View::class,
            View::EVENT_REGISTER_CP_TEMPLATE_ROOTS,
            function (RegisterTemplateRootsEvent $event): void {
                $event->roots['general'] = __DIR__ . '/templates';
            },
        );

        if ($request->getIsCpRequest()) {
            $view->hook('cp.layouts.base', static function (array &$context): void {
                $environment = App::env('CRAFT_ENVIRONMENT');
                $context['bodyAttributes']['class'][] = sprintf('env-%s', is_scalar($environment) ? $environment : '');
            });

            CraftEvent::once(
                View::class,
                View::EVENT_BEFORE_RENDER_TEMPLATE,
                function () use ($app, $view): void {
                    $plugin = $app->getPlugins()->getPlugin('vite');

                    if ($plugin instanceof Vite) {
                        $view->registerHtml(
                            $plugin->getVite()->script('src/dashboard.js'),
                            View::POS_HEAD,
                        );
                    }
                },
            );

            Event::on(
                Asset::class,
                Asset::EVENT_AFTER_DELETE,
                function (Event $event): void {
                    if ($event->sender instanceof Asset) {
                        $this->purgeImgixAsset($event->sender);
                    }
                },
            );

            Event::on(
                Assets::class,
                Assets::EVENT_BEFORE_REPLACE_ASSET,
                function (ReplaceAssetEvent $event): void {
                    $this->purgeImgixAsset($event->asset);

                    $event->filename = implode('.', [
                        pathinfo($event->filename, PATHINFO_FILENAME),
                        StringHelper::randomStringWithChars('abcdefghijklmnopqrstuvwxyz0123456789', 7),
                        mb_strtolower(pathinfo($event->filename, PATHINFO_EXTENSION)),
                    ]);
                },
            );
        }
    }

    protected function purgeImgixAsset(Asset $asset): void
    {
        $imgixUrl = App::env('IMGIX_URL');
        $apiKey = App::env('IMGIX_API_KEY');
        $storageUrl = App::env('OBJECT_STORAGE_URL');

        if (!is_string($apiKey) || $apiKey === '' || !$asset->supportsImageEditor || !$asset->url || !is_string($imgixUrl) || !is_string($storageUrl)) {
            return;
        }

        $target = str_replace($storageUrl, $imgixUrl, $asset->url);

        new Client()->post('https://api.imgix.com/api/v1/purge', [
            'headers' => [
                'Authorization' => sprintf('Bearer %s', $apiKey),
                'Content-Type' => 'application/vnd.api+json',
            ],
            'json' => [
                'data' => [
                    'attributes' => ['url' => $target],
                    'type' => 'purges',
                ],
            ],
        ]);
    }
}
