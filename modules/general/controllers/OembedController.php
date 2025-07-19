<?php

declare(strict_types=1);

namespace modules\general\controllers;

use Craft;
use craft\web\Response;
use craft\web\Controller;
use modules\general\services\Serializer;
use spicyweb\embeddedassets\models\EmbeddedAsset;
use spicyweb\embeddedassets\Plugin as EmbeddedAssets;

class OembedController extends Controller
{
    protected array|int|bool $allowAnonymous = self::ALLOW_ANONYMOUS_LIVE;

    public function actionIndex(): Response
    {
        $this->requirePostRequest();

        $url = Craft::$app->request->getBodyParam('url');

        /** @var EmbeddedAsset */
        $embed = EmbeddedAssets::$plugin->methods->requestUrl($url, false);

        return $this->asJson(Serializer::embed($embed));
    }
}
