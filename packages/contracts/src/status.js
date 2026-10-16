/**
 * Standard Status Enums for Tasks and Execution Jobs
 */
const AiTaskStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

const AstraTaskStatus = {
  PROPOSED: 'proposed',
  APPROVED: 'approved',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

const RunnerJobStatus = {
  QUEUED: 'queued',
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  TIMED_OUT: 'timed_out',
  CANCELLED: 'cancelled',
  BLOCKED: 'blocked',
  DISABLED: 'disabled'
};

module.exports = {
  AiTaskStatus,
  AstraTaskStatus,
  RunnerJobStatus
};
