// Central Task Types & Architecture Planning State Machine for ASTRA Assistant

export const ASTRA_TASK_TYPES = [
  { id: 'feature', label: 'Create a Feature', description: 'Design and implement a new endpoint, module, or component.' },
  { id: 'bugfix', label: 'Fix a Bug', description: 'Diagnose runtime errors, exceptions, or unexpected behavior.' },
  { id: 'explain', label: 'Explain Code', description: 'Walk through algorithms, architecture patterns, and design decisions.' },
  { id: 'refactor', label: 'Refactor Code', description: 'Enhance code cleanliness, modularity, and maintainability.' },
  { id: 'tests', label: 'Write Tests', description: 'Generate comprehensive unit, integration, and property test suites.' },
  { id: 'review', label: 'Review Code', description: 'Audit pull requests, diff proposals, and identify potential bugs.' },
  { id: 'performance', label: 'Improve Performance', description: 'Profile hotspots, optimize memory allocation, and speed up queries.' },
  { id: 'error', label: 'Investigate Error', description: 'Analyze tracebacks, stack frames, and unhandled rejections.' },
  { id: 'docs', label: 'Generate Documentation', description: 'Draft OpenAPI specifications, markdown guides, and docstrings.' },
  { id: 'dependencies', label: 'Analyze Dependencies', description: 'Check for outdated packages, security CVEs, and licensing.' },
  { id: 'schema', label: 'Design DB Schema', description: 'Model relational tables, foreign keys, constraints, and indices.' },
  { id: 'sql', label: 'Write & Review SQL', description: 'Craft optimized SELECT queries, migrations, and analyze EXPLAIN plans.' },
  { id: 'deploy', label: 'Prepare Deployment', description: 'Configure Dockerfiles, environment secrets, and health checks.' },
  { id: 'build_failure', label: 'Analyze Build Failures', description: 'Debug compiler errors, missing symbols, and linker crashes.' },
  { id: 'security', label: 'Analyze Security Findings', description: 'Review authentication boundaries, rate limiters, and sanitize inputs.' }
];

export const TASK_STATES = {
  DRAFT: 'draft',
  PLANNING: 'planning',
  AWAITING_PLAN_REVIEW: 'awaiting_plan_review',
  PLAN_APPROVED: 'plan_approved',
  CHANGES_PROPOSED: 'changes_proposed',
  AWAITING_CHANGE_REVIEW: 'awaiting_change_review',
  CHANGES_APPROVED: 'changes_approved',
  READY_TO_TEST: 'ready_to_test',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};
