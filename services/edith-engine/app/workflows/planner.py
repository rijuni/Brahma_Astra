class PlanningUnavailableError(RuntimeError):
    """Raised until EDITH has a configured provider and workspace-aware planner."""


class WorkflowPlanner:
    def plan_coding_task(self, task_id: str, workspace_id: str, instruction: str, files=None):
        raise PlanningUnavailableError(
            "Patch planning is unavailable: no workspace-aware coding planner is configured."
        )


planner = WorkflowPlanner()
