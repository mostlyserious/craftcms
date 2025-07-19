<?php

declare(strict_types=1);

use craft\helpers\App;
use craft\helpers\UrlHelper;

$manifest = Craft::getAlias(sprintf('@webroot%s/.vite/manifest.json', App::env('VITE_BASE')));

return [
    'manifestPath' => $manifest,
    'useDevServer' => !is_file($manifest),
    'serverPublic' => UrlHelper::siteHost() . App::env('VITE_BASE') . '/',
    'devServerPublic' => implode(':', [
        App::env('PRIMARY_SITE_URL'),
        App::env('VITE_PORT'),
    ]) . App::env('VITE_BASE') . '/',
];
