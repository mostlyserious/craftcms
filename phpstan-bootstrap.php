<?php

declare(strict_types=1);

defined('CRAFT_BASE_PATH') || define('CRAFT_BASE_PATH', __DIR__);
defined('CRAFT_VENDOR_PATH') || define('CRAFT_VENDOR_PATH', CRAFT_BASE_PATH . '/vendor');

require_once CRAFT_VENDOR_PATH . '/autoload.php';

if (!class_exists('Yii', false)) {
    require_once CRAFT_VENDOR_PATH . '/craftcms/cms/lib/yii2/Yii.php';
}

if (!class_exists('Craft', false)) {
    require_once CRAFT_VENDOR_PATH . '/craftcms/cms/src/Craft.php';
}
