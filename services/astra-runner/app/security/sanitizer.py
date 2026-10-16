import os
import re
from typing import Dict

# Safe allowlisted environment variables for child execution
SAFE_ENV_ALLOWLIST = {
    "PATH", "SYSTEMROOT", "TMP", "TEMP", "LANG", "LC_ALL",
    "COMSPEC", "PATHEXT", "PYTHONPATH", "NODE_PATH"
}

BLOCKED_PATTERNS = [
    re.compile(p, re.IGNORECASE) for p in [
        r".*KEY.*", r".*SECRET.*", r".*TOKEN.*", r".*PASS.*",
        r".*DATABASE.*", r".*PRISMA.*", r".*AWS.*", r".*AUTH.*",
        r".*GEMINI.*", r".*OPENAI.*", r".*ANTHROPIC.*"
    ]
]

def sanitize_environment(custom_env: Dict[str, str] = None) -> Dict[str, str]:
    """
    Creates a clean, isolated environment dictionary containing only allowlisted
    variables, strictly stripping all secret credentials from the host process.
    """
    clean_env = {}

    for key, value in os.environ.items():
        if key.upper() in SAFE_ENV_ALLOWLIST:
            # Verify variable value doesn't match secret patterns
            if not any(pattern.match(key) for pattern in BLOCKED_PATTERNS):
                clean_env[key] = value

    if custom_env:
        for k, v in custom_env.items():
            if not any(pattern.match(k) for pattern in BLOCKED_PATTERNS):
                clean_env[k] = str(v)

    return clean_env
