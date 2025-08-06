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
use modules\general\services\Serializer;
use craft\web\twig\variables\CraftVariable;
use craft\events\RegisterTemplateRootsEvent;
use modules\general\web\twig\GeneralExtension;

/**
 * @property-read Serializer $serializer
 */
class General extends Module
{
    public function init(): void
    {
        Craft::setAlias('@modules/general', __DIR__);

        if (Craft::$app->request->isConsoleRequest) {
            $this->controllerNamespace = 'modules\\general\\console\\controllers';
        } else {
            $this->controllerNamespace = 'modules\\general\\controllers';
        }

        parent::init();

        Craft::$app->view->registerTwigExtension(GeneralExtension::instance());

        Craft::$app->onInit(function (): void {
            $this->setComponents([
                'serializer' => Serializer::class,
            ]);
        });

        Event::on(
            CraftVariable::class,
            CraftVariable::EVENT_INIT,
            function (Event $event): void {
                $event->sender->set('serializer', Serializer::class);
            },
        );

        Event::on(
            View::class,
            View::EVENT_REGISTER_CP_TEMPLATE_ROOTS,
            function (RegisterTemplateRootsEvent $event): void {
                $event->roots['general'] = __DIR__ . '/templates';
            },
        );

        if (Craft::$app->request->getIsCpRequest()) {
            Craft::$app->view->hook('cp.layouts.base', static function (array &$context): void {
                $context['bodyAttributes']['class'][] = sprintf('env-%s', App::env('CRAFT_ENVIRONMENT'));
            });

            CraftEvent::once(
                View::class,
                View::EVENT_BEFORE_RENDER_TEMPLATE,
                function (): void {
                    if (Craft::$app->plugins->getPlugin('vite')) {
                        Craft::$app->view->registerHtml(
                            Vite::$plugin->get('vite')->script('src/dashboard.js'),
                            View::POS_HEAD,
                        );
                    }
                },
            );

            Event::on(
                Asset::class,
                Asset::EVENT_AFTER_DELETE,
                function (Event $event): void {
                    $this->purgeImgixAsset($event->sender);
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
        if (!App::env('IMGIX_API_KEY') || !$asset->supportsImageEditor) {
            return;
        }

        $target = str_replace(App::env('OBJECT_STORAGE_URL'), App::env('IMGIX_URL'), $asset->url);

        (new Client())->post('https://api.imgix.com/api/v1/purge', [
            'headers' => [
                'Authorization' => sprintf('Bearer %s', App::env('IMGIX_API_KEY')),
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
