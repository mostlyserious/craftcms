#!/bin/bash

if [ ! -f "${PWD}/stylelint.config.js" ]; then
    printf "export default {\n    extends: 'stylelint-config-hudochenkov/order',\n}\n" > "${PWD}/stylelint.config.js"
    bun add stylelint-config-hudochenkov --dev &>/dev/null
    sleep 1
fi

if [ "$1" = "html" ]; then
    ./node_modules/.bin/stylelint --fix --stdin --custom-syntax=postcss-html
else
    ./node_modules/.bin/stylelint --fix --stdin
fi
