<?php

declare(strict_types=1);

use craft\helpers\App;
use craft\helpers\UrlHelper;

$viteBase = App::env('VITE_BASE');
$viteBase = is_string($viteBase) ? $viteBase : '';
$primarySiteUrl = App::env('PRIMARY_SITE_URL');
$primarySiteUrl = is_string($primarySiteUrl) ? $primarySiteUrl : '';
$vitePort = App::env('VITE_PORT');
$vitePort = is_scalar($vitePort) ? (string) $vitePort : '';

$manifest = Craft::getAlias(sprintf('@webroot%s/.vite/manifest.json', $viteBase));

return [
    'manifestPath' => $manifest,
    'useDevServer' => !is_file($manifest),
    'serverPublic' => UrlHelper::siteHost() . $viteBase . '/',
    'devServerPublic' => implode(':', [
        $primarySiteUrl,
        $vitePort,
    ]) . $viteBase . '/',
];
