#!/bin/bash

TEMP_BASE=$(mktemp) || exit $?
TEMP_FILE="${TEMP_BASE}.php"

trap 'rm -f "$TEMP_BASE" "$TEMP_FILE"' EXIT

touch "$TEMP_FILE" || exit $?
rm -f "$TEMP_BASE" || exit $?

cat > "$TEMP_FILE"

if php vendor/bin/pint "$TEMP_FILE" "$@" >/dev/null; then
    cat "$TEMP_FILE"
else
    exit $?
fi
