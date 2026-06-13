#!/bin/bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
HOST_FILE="${1:-}"
STDIN_FILENAME="utility/pint-stdin.php"

if [[ -n "$HOST_FILE" ]]; then
    case "$HOST_FILE" in
        "$PROJECT_DIR"/*)
            STDIN_FILENAME="${HOST_FILE#"$PROJECT_DIR"/}"
            ;;
        *)
            STDIN_FILENAME="$HOST_FILE"
            ;;
    esac
fi

cd "$PROJECT_DIR"

if [[ "${IS_DDEV_PROJECT:-}" == "true" ]]; then
    php vendor/bin/pint --stdin-filename="$STDIN_FILENAME"
else
    ddev php vendor/bin/pint --stdin-filename="$STDIN_FILENAME"
fi
