#!/bin/bash

TEMP_FILE=$(mktemp)
mv "$TEMP_FILE" "${TEMP_FILE}.php"
TEMP_FILE="${TEMP_FILE}.php"

trap 'rm -f "$TEMP_FILE"' EXIT

cat > "$TEMP_FILE"

if php vendor/bin/pint "$TEMP_FILE" "$@" >/dev/null; then
    cat "$TEMP_FILE"
else
    exit $?
fi
