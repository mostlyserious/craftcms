#!/bin/bash

if [ "$1" = "html" ]; then
    ./node_modules/.bin/stylelint --fix --stdin --custom-syntax=postcss-html
else
    ./node_modules/.bin/stylelint --fix --stdin
fi
