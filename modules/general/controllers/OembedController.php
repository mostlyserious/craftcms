<?php

declare(strict_types=1);

namespace modules\general\controllers;

use Craft;
use RuntimeException;
use yii\web\Response;
use craft\web\Controller;
use craft\web\Application;
use InvalidArgumentException;
use modules\general\services\Serializer;
use spicyweb\embeddedassets\models\EmbeddedAsset;
use spicyweb\embeddedassets\Plugin as EmbeddedAssets;

class OembedController extends Controller
{
    protected array|int|bool $allowAnonymous = self::ALLOW_ANONYMOUS_LIVE;

    public function actionIndex(): Response
    {
        $this->requirePostRequest();

        $app = Craft::$app;

        if (!$app instanceof Application) {
            throw new RuntimeException('Craft web application is not available');
        }

        $request = $app->getRequest();
        $url = $request->getRequiredBodyParam('url');

        if (!is_string($url) || !filter_var($url, FILTER_VALIDATE_URL)) {
            throw new InvalidArgumentException('Invalid URL');
        }

        if (!EmbeddedAssets::$plugin) {
            throw new RuntimeException('Embedded Assets plugin is not installed');
        }

        /** @var EmbeddedAsset */
        $embed = EmbeddedAssets::$plugin->methods->requestUrl($url, false);

        return $this->asJson(Serializer::embed($embed));
    }
}
