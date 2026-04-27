#!/bin/bash

TEMP_BASE=$(mktemp)
TEMP_FILE="${TEMP_BASE}.php"
touch "$TEMP_FILE" && rm -f "$TEMP_BASE" || { rm -f "$TEMP_BASE"; exit 1; }

trap 'rm -f "$TEMP_FILE"' EXIT

cat > "$TEMP_FILE"

if php vendor/bin/pint "$TEMP_FILE" "$@" >/dev/null; then
    cat "$TEMP_FILE"
else
    exit $?
fi
