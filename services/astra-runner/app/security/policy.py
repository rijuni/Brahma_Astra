import re
from typing import List, Tuple

DANGEROUS_COMMANDS = [
    r"\bsudo\b", r"\bsu\b", r"\bchown\b", r"\bchmod\s+777\b",
    r"\biptables\b", r"\bufw\b", r"\bshutdown\b", r"\breboot\b",
    r"rm\s+-rf\s+/", r"rmdir\s+/s\s+/q\s+[c-zC-Z]:\\",
    r"\bmkfs\b", r"\bdd\b", r"\bformat\b", r"\bcurl\b", r"\bwget\b",
    r"\bnc\b", r"\bnetcat\b", r"\bnmap\b"
]

COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in DANGEROUS_COMMANDS]

def validate_command_safety(command: str) -> Tuple[bool, str]:
    """
    Validates whether a command violates core safety policies.
    Returns (is_safe, reason).
    """
    if not command or not command.strip():
        return False, "Empty command is not executable"

    for pattern in COMPILED_PATTERNS:
        if pattern.search(command):
            return False, f"Policy violation: Command contains prohibited pattern '{pattern.pattern}'"

    return True, "Command passed security policy checks"
