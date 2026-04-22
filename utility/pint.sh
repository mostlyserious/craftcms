#!/bin/bash

TEMP_FILE=$(mktemp --suffix=.php)

trap 'rm -f "$TEMP_FILE"' EXIT

cat > "$TEMP_FILE"

if php vendor/bin/pint "$TEMP_FILE" "$@" >/dev/null; then
    cat "$TEMP_FILE"
else
    exit $?
fi
