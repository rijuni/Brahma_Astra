// EDITH Security Boundary and Runner Status Service

export const edithRunnerService = {
  // Query host execution boundary status
  async getSecurityStatus() {
    return {
      executionMode: 'disabled',
      hostGuardActive: true,
      sandboxType: 'Windows Host Security Boundary (Restricted)',
      arbitraryExecutionAllowed: false,
      message: 'Arbitrary shell execution is disabled on the host Windows system. Isolated microVM sandbox is required for untrusted execution.'
    };
  },

  // Preview-only commands. These strings are generated locally and never execute commands.
  async runSafeCommand(cmd = '') {
    const trimmed = cmd.trim();
    const ts = new Date().toLocaleTimeString();

    if (trimmed === 'help') {
      return [
        `[${ts}] EDITH Terminal Preview`,
        'This preview does not execute commands or query service health.',
        '  status   - Show configured local service endpoints (no live check)',
        '  health   - Explain current execution policy',
        '  clear    - Clear the preview output',
        '  build    - Show preview-only build output',
        '  test     - Show sample test output'
      ].join('\n');
    }

    if (trimmed === 'status') {
      return [
        `[${ts}] [PREVIEW ONLY]`,
        '  API endpoints are configured for local development.',
        '  No live health checks were performed by this terminal preview.',
        '  Use EDITH Settings to request service health checks.'
      ].join('\n');
    }

    if (trimmed === 'health') {
      return `[${ts}] [PREVIEW ONLY] Live database and runner health were not queried. Arbitrary execution remains disabled by default.`;
    }

    if (trimmed === 'build') {
      return [
        `[${ts}] [SAMPLE OUTPUT] No build was started.`,
        'Run the repository build from a trusted developer terminal to get a real result.'
      ].join('\n');
    }

    if (trimmed === 'test') {
      return [
        `[${ts}] [SAMPLE OUTPUT] No tests were started.`,
        'Run the project test suite from a trusted developer terminal to get real results.'
      ].join('\n');
    }

    return `[${ts}] Command execution is disabled in this preview. Type "help" for display-only commands.`;
  }
};

export const astraRunnerService = edithRunnerService;
