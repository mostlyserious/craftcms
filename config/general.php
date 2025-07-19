<?php

declare(strict_types=1);

use craft\helpers\App;
use craft\helpers\ConfigHelper;
use craft\helpers\DateTimeHelper;

return [
    '*' => [
        'asyncCsrfInputs' => true,
        'preventUserEnumeration' => true,
        'omitScriptNameInUrls' => true,
        'defaultWeekStartDay' => 0,
        'enableGql' => false,
        'pageTrigger' => 'page/',
        'errorTemplatePrefix' => '_',
        'timezone' => 'America/Chicago',
        'addTrailingSlashesToUrls' => true,
        'runQueueAutomatically' => true,
        'sendPoweredByHeader' => false,
        'maxUploadFileSize' => ConfigHelper::sizeInBytes('128M'),
        'cacheDuration' => DateTimeHelper::SECONDS_MONTH,
        'previewTokenDuration' => DateTimeHelper::SECONDS_MONTH,
        'userSessionDuration' => DateTimeHelper::SECONDS_HOUR,
        'rememberedUserSessionDuration' => DateTimeHelper::SECONDS_DAY,
        'aliases' => [
            '@webroot' => CRAFT_BASE_PATH . '/web',
            '@fontawesome' => CRAFT_BASE_PATH . '/vendor/npm-asset/fortawesome--fontawesome-pro/svgs',
        ],
    ],
    'dev' => [
        'devMode' => true,
        'disallowRobots' => true,
        'backupOnUpdate' => false,
        'userSessionDuration' => false,
        'runQueueAutomatically' => true,
        'testToEmailAddress' => App::env('SYSTEM_EMAIL_TEST_ADDRESS') ?: App::env('SYSTEM_EMAIL_ADDRESS'),
    ],
    'staging' => [
        'disallowRobots' => true,
        'allowAdminChanges' => false,
        'testToEmailAddress' => App::env('SYSTEM_EMAIL_TEST_ADDRESS') ?: null,
    ],
    'production' => [
        'allowAdminChanges' => false,
    ],
];
