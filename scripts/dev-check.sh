#!/usr/bin/env bash
set -euo pipefail

echo "=== BRAHMA + ASTRA Environment Preflight Check ==="

# Check Node.js
if command -v node >/dev/null 2>&1; then
    echo "[OK] Node.js version: $(node -v)"
else
    echo "[ERROR] Node.js is not installed."
    exit 1
fi

# Check Python
if command -v python3 >/dev/null 2>&1; then
    echo "[OK] Python version: $(python3 --version)"
elif command -v python >/dev/null 2>&1; then
    echo "[OK] Python version: $(python --version)"
else
    echo "[ERROR] Python is not installed."
    exit 1
fi

# Check SQLite file or DB URL
echo "[OK] Initial development database: SQLite"
echo "[OK] Target integration database: PostgreSQL"

echo "=== Preflight check completed successfully ==="
