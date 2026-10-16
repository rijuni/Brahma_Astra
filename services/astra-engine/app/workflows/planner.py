from typing import Dict, Any, List
from app.schemas.tasks import PatchProposal, PatchFile

class WorkflowPlanner:
    def plan_coding_task(self, task_id: str, workspace_id: str, instruction: str, files: Dict[str, str] = None) -> PatchProposal:
        """
        Analyzes instruction and generates proposed patches for approval.
        """
        summary = f"Generated solution for: {instruction[:100]}"
        patch_files: List[PatchFile] = []

        # If instruction suggests a specific file or test, propose patch
        suggested_file = "src/solution.py" if "python" in instruction.lower() else "src/index.js"
        diff_preview = (
            f"--- a/{suggested_file}\n"
            f"+++ b/{suggested_file}\n"
            f"@@ -1,3 +1,5 @@\n"
            f"+// Implemented per instruction: {instruction[:60]}\n"
            f"+export function solution() {{ return true; }}\n"
        )

        patch_files.append(PatchFile(
            file_path=suggested_file,
            operation="create",
            diff=diff_preview,
            content=f"// Implemented per instruction: {instruction}\n"
        ))

        risk_level = "high" if any(w in instruction.lower() for w in ["delete", "drop", "purge", "rm"]) else "low"

        return PatchProposal(
            summary=summary,
            files=patch_files,
            risk_level=risk_level
        )

planner = WorkflowPlanner()
