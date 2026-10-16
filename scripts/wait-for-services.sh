#!/usr/bin/env bash
# wait-for-services.sh
set -e

HOST=${1:-"localhost"}
PORT=${2:-"3000"}
TIMEOUT=${3:-30}

echo "Waiting for service at ${HOST}:${PORT} for up to ${TIMEOUT}s..."
START_TIME=$(date +%s)

while true; do
    if nc -z "$HOST" "$PORT" 2>/dev/null; then
        echo "Service at ${HOST}:${PORT} is available!"
        exit 0
    fi

    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))
    if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
        echo "Timed out waiting for ${HOST}:${PORT}"
        exit 1
    fi
    sleep 1
done
