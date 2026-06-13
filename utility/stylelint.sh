#!/bin/bash

set -euo pipefail

ARGS=(--fix --stdin)

if [ "${1:-}" = "html" ]; then
    ARGS+=(--custom-syntax=postcss-html)
fi

if [[ "${IS_DDEV_PROJECT:-}" == "true" ]]; then
    ./node_modules/.bin/stylelint "${ARGS[@]}"
else
    ddev exec ./node_modules/.bin/stylelint "${ARGS[@]}"
fi
