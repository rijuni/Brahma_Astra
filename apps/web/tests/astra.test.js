import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');

// ============================================================================
// Milestone 1 & Design Directive: Dedicated ASTRA Vector Mark & Brand Identity
// ============================================================================
test('Milestone 1 — ASTRA Dedicated Vector Mark Exists & Conforms to Celestial Identity', () => {
  const markPath = path.join(webRoot, 'public', 'brand', 'astra-mark.svg');
  assert.ok(fs.existsSync(markPath), 'public/brand/astra-mark.svg must exist');

  const content = fs.readFileSync(markPath, 'utf8');
  assert.ok(content.startsWith('<svg'), 'astra-mark.svg must be valid SVG');
  assert.match(content, /id="astraArrowGrad"/i, 'Must feature celestial arrow gradient');
  assert.match(content, /id="astraGoldGrad"/i, 'Must feature golden radiant gradient');
  assert.match(content, /d="M50\s+12\s+L61\s+48/i, 'Must feature primary celestial arrow spine');
  assert.match(content, /circle.*r="46"/i, 'Must feature outer sacred geometry yantra boundary ring');
});

// ============================================================================
// Milestone 1: Opening Cinematic Animation (AstraLauncher)
// ============================================================================
test('Milestone 1 — AstraLauncher Implements 4-Stage Opening Flow & Skip Action', () => {
  const launcherPath = path.join(webRoot, 'src', 'features', 'astra', 'AstraLauncher.jsx');
  assert.ok(fs.existsSync(launcherPath), 'AstraLauncher.jsx must exist');

  const content = fs.readFileSync(launcherPath, 'utf8');
  assert.match(content, /animationStep,\s*setAnimationStep/i, 'Must track multi-stage animation steps');
  assert.match(content, /setTimeout\(\(\)\s*=>\s*setAnimationStep\(2\),\s*700\)/i, 'Stage 1 -> Stage 2 transition');
  assert.match(content, /handleSkip/i, 'Must support immediate skip / enter workspace');
  assert.match(content, /onEnterWorkspace/i, 'Must notify parent on completion');
  assert.match(content, /onBackToBrahma/i, 'Must allow return to BRAHMA dashboard');
  assert.match(content, /TURN IDEAS INTO REALITY/i, 'Must feature ASTRA brand tagline');
});

// ============================================================================
// Milestone 2: ASTRA Studio Shell & Layout Structure
// ============================================================================
test('Milestone 2 — AstraShell Renders Activity Bar, Breadcrumbs, and Sandboxed Disclosures', () => {
  const shellPath = path.join(webRoot, 'src', 'features', 'astra', 'AstraShell.jsx');
  assert.ok(fs.existsSync(shellPath), 'AstraShell.jsx must exist');

  const content = fs.readFileSync(shellPath, 'utf8');
  assert.match(content, /astra-activity-bar/i, 'Must define vertical activity bar');
  assert.match(content, /topNavItems/i, 'Must configure activity bar items');
  assert.match(content, /onBackToBrahma/i, 'Must render Return to BRAHMA button');
  assert.match(content, /Sandboxed Runner\s*:8003/i, 'Must provide truthful sandbox status disclosure');
  assert.match(content, /ASTRA Engine\s*:8002/i, 'Must provide live engine indicator');
});

// ============================================================================
// Milestone 3: 30+ Language Registry & Multi-File Code Editor
// ============================================================================
test('Milestone 3 — Language Registry Supports 30+ Languages with Capability Matrices', () => {
  const langPath = path.join(webRoot, 'src', 'config', 'astra-languages.js');
  assert.ok(fs.existsSync(langPath), 'astra-languages.js must exist');

  const content = fs.readFileSync(langPath, 'utf8');
  assert.match(content, /ASTRA_LANGUAGES\s*=/i, 'Must export ASTRA_LANGUAGES');
  assert.match(content, /getLanguageForFile/i, 'Must export extension/file resolver');
  assert.match(content, /id:\s*'javascript'/i, 'Must support JavaScript');
  assert.match(content, /id:\s*'python'/i, 'Must support Python');
  assert.match(content, /id:\s*'rust'/i, 'Must support Rust');
  assert.match(content, /id:\s*'go'/i, 'Must support Go');
  assert.match(content, /id:\s*'sql'/i, 'Must support SQL');
  assert.match(content, /id:\s*'typescript'/i, 'Must support TypeScript');
  assert.match(content, /id:\s*'cpp'/i, 'Must support C++');
});

test('Milestone 3 — CodeEditor Component Supports Multi-Tab, Line Numbers, Ctrl+S, & Read-Only Toggle', () => {
  const editorPath = path.join(webRoot, 'src', 'features', 'astra', 'components', 'CodeEditor.jsx');
  assert.ok(fs.existsSync(editorPath), 'CodeEditor.jsx must exist');

  const content = fs.readFileSync(editorPath, 'utf8');
  assert.match(content, /astra-line-number/i, 'Must render line number gutter');
  assert.match(content, /handleKeyDown/i, 'Must bind keyboard shortcuts');
  assert.match(content, /e\.key\s*===\s*'s'/i, 'Must support Ctrl+S save shortcut');
  assert.match(content, /e\.key\s*===\s*'f'/i, 'Must support Ctrl+F find shortcut');
  assert.match(content, /isReadOnly/i, 'Must support read-only mode toggle');
  assert.match(content, /isDirty/i, 'Must indicate dirty/unsaved state');
});

// ============================================================================
// Milestone 4: Human-in-the-Loop Patch Review & Diff Viewer
// ============================================================================
test('Milestone 4 — PatchReview Implements Unified Diff Viewer with Risk Badges & Approval Actions', () => {
  const patchPath = path.join(webRoot, 'src', 'features', 'astra', 'components', 'PatchReview.jsx');
  assert.ok(fs.existsSync(patchPath), 'PatchReview.jsx must exist');

  const content = fs.readFileSync(patchPath, 'utf8');
  assert.match(content, /diff-line-add/i, 'Must highlight added lines in diff');
  assert.match(content, /diff-line-del/i, 'Must highlight deleted lines in diff');
  assert.match(content, /onApprove/i, 'Must support patch approval');
  assert.match(content, /onReject/i, 'Must support patch rejection');
  assert.match(content, /risk_level/i, 'Must assess and display patch risk level');
  assert.match(content, /Approve & Apply Patch/i, 'Must provide prominent action button');
});

// ============================================================================
// Milestone 5: Autonomous AI Coding Assistant & Task Engine
// ============================================================================
test('Milestone 5 — AstraAssistant Implements 15 Task Types & Planning State Machine', () => {
  const tasksConfigPath = path.join(webRoot, 'src', 'config', 'astra-tasks.js');
  const assistantPath = path.join(webRoot, 'src', 'features', 'astra', 'components', 'AstraAssistant.jsx');

  assert.ok(fs.existsSync(tasksConfigPath), 'astra-tasks.js must exist');
  assert.ok(fs.existsSync(assistantPath), 'AstraAssistant.jsx must exist');

  const tasksContent = fs.readFileSync(tasksConfigPath, 'utf8');
  assert.match(tasksContent, /id:\s*'feature'/i, 'Supports feature development');
  assert.match(tasksContent, /id:\s*'bugfix'/i, 'Supports bug fixes');
  assert.match(tasksContent, /id:\s*'refactor'/i, 'Supports refactoring');
  assert.match(tasksContent, /id:\s*'security'/i, 'Supports security analysis');
  assert.match(tasksContent, /id:\s*'tests'/i, 'Supports test writing');
  assert.match(tasksContent, /TASK_STATES\s*=/i, 'Exports TASK_STATES planning states');

  const assistantContent = fs.readFileSync(assistantPath, 'utf8');
  assert.match(assistantContent, /aiThinkWave/i, 'Includes thinking wave animation indicator');
  assert.match(assistantContent, /handleSend/i, 'Includes task dispatch trigger');
  assert.match(assistantContent, /selectedTaskType,\s*setSelectedTaskType/i, 'Manages task type selection');
});

// ============================================================================
// Milestone 6: Integrated Developer Tools (Terminal, Tests, Debug, Git, API, DB)
// ============================================================================
test('Milestone 6 — Developer Tools Components Exist & Implement Production Features', () => {
  const tools = [
    { file: 'TerminalPanel.jsx', checks: [/runSafeCommand/i, /Safe Boundary/i] },
    { file: 'TestRunnerPanel.jsx', checks: [/Coverage/i, /handleRunTests/i] },
    { file: 'DebugPanel.jsx', checks: [/breakpoints/i, /callStack/i, /variables/i] },
    { file: 'GitPanel.jsx', checks: [/branch/i, /handleCommit/i, /staged/i] },
    { file: 'ApiClientPanel.jsx', checks: [/url/i, /handleSend/i, /HTTP/i] },
    { file: 'DatabasePanel.jsx', checks: [/SQLite/i, /PostgreSQL/i, /handleExecute/i] },
    { file: 'DeployPanel.jsx', checks: [/docker/i, /production/i, /handleDeploy/i] },
    { file: 'PipelinesPanel.jsx', checks: [/stages/i, /Pipeline/i] },
    { file: 'ProjectSummaryPanel.jsx', checks: [/techStack/i, /metrics/i] },
    { file: 'TaskHistoryPanel.jsx', checks: [/onRestoreTask/i, /Restore Session/i] },
    { file: 'AstraSettingsPanel.jsx', checks: [/KEYBOARD SHORTCUTS/i, /INTEGRATION STATUS MATRIX/i] }
  ];

  for (const { file, checks } of tools) {
    const fullPath = path.join(webRoot, 'src', 'features', 'astra', 'components', file);
    assert.ok(fs.existsSync(fullPath), `${file} must exist`);
    const content = fs.readFileSync(fullPath, 'utf8');
    for (const check of checks) {
      assert.match(content, check, `${file} must match ${check}`);
    }
  }
});

// ============================================================================
// Milestone 7: Safe Execution Boundaries & Truthful Disclosures
// ============================================================================
test('Milestone 7 — Safe Execution Boundary Blocks Host Arbitrary Code Execution', () => {
  const runnerPath = path.join(webRoot, 'src', 'services', 'astra', 'astra-runner-service.js');
  assert.ok(fs.existsSync(runnerPath), 'astra-runner-service.js must exist');

  const content = fs.readFileSync(runnerPath, 'utf8');
  assert.match(content, /Available built-in safe commands/i, 'Must define built-in safe diagnostic commands');
  assert.match(content, /Arbitrary shell execution is disabled/i, 'Must disclose disabled arbitrary shell execution');
  assert.match(content, /runSafeCommand/i, 'Must export runSafeCommand function');
});

// ============================================================================
// Milestone 8: Live Backend Service Integration
// ============================================================================
test('Milestone 8 — ASTRA Service Integrates with Node.js Backend API Endpoints', () => {
  const servicePath = path.join(webRoot, 'src', 'services', 'astra', 'astra-service.js');
  assert.ok(fs.existsSync(servicePath), 'astra-service.js must exist');

  const content = fs.readFileSync(servicePath, 'utf8');
  assert.match(content, /\/astra\/workspaces/i, 'Must call /api/v1/astra/workspaces');
  assert.match(content, /\/astra\/tasks/i, 'Must call /api/v1/astra/tasks');
  assert.match(content, /\/approve/i, 'Must call task approval endpoint');
  assert.match(content, /\/cancel/i, 'Must call task cancellation endpoint');
});

// ============================================================================
// Design Directive: 100% Adherence to BRAHMA Cosmic Translucent Theme
// ============================================================================
test('Design Directive — ASTRA Stylesheet Matches BRAHMA Cosmic Glass & Dark Theme', () => {
  const astraCssPath = path.join(webRoot, 'src', 'styles', 'astra.css');
  assert.ok(fs.existsSync(astraCssPath), 'astra.css must exist');

  const content = fs.readFileSync(astraCssPath, 'utf8');
  assert.match(content, /--brand-gold/i, 'Must use BRAHMA gold token');
  assert.match(content, /--glass-border/i, 'Must use BRAHMA glass border tokens');
  assert.match(content, /backdrop-filter:\s*blur/i, 'Must enforce translucent glassmorphic blur');
  assert.match(content, /@keyframes\s+astraPortalBurst/i, 'Must define celestial portal animation');
  assert.match(content, /@keyframes\s+astraYantraSpin/i, 'Must define sacred geometry yantra animation');
  assert.match(content, /astra-activity-bar/i, 'Must style vertical activity bar');
});

// ============================================================================
// Comprehensive Domain Audits: All 11 Core Functional Domains
// ============================================================================

test('Domain 1 — Workspace & Project Explorer Supports Search, Templates & Export', () => {
  const pPath = path.join(webRoot, 'src', 'features', 'astra', 'components', 'ProjectExplorer.jsx');
  assert.ok(fs.existsSync(pPath), 'ProjectExplorer.jsx must exist');
  const content = fs.readFileSync(pPath, 'utf8');
  assert.match(content, /TEMPLATE_OPTIONS/i, 'Must provide starter workspace templates');
  assert.match(content, /handleExportJson/i, 'Must support project JSON manifest export');
  assert.match(content, /handleDuplicate/i, 'Must support workspace duplication');
  assert.match(content, /handleDeletePrompt/i, 'Must support workspace deletion modal');
  assert.match(content, /searchTerm/i, 'Must support workspace filtering');
});

test('Domain 2 — File Explorer Supports Subtrees, Inline Creation, Renaming & Deletion', () => {
  const fPath = path.join(webRoot, 'src', 'features', 'astra', 'components', 'FileTree.jsx');
  assert.ok(fs.existsSync(fPath), 'FileTree.jsx must exist');
  const content = fs.readFileSync(fPath, 'utf8');
  assert.match(content, /treeData/i, 'Must compute hierarchical folder and file tree');
  assert.match(content, /toggleFolder/i, 'Must support collapsible folders');
  assert.match(content, /handleCopyPath/i, 'Must support clipboard path copying');
  assert.match(content, /renamingFile/i, 'Must support file renaming modal');
  assert.match(content, /deleteConfirmFile/i, 'Must support file deletion confirmation');
});

test('Domain 3 — Code Editor Implements Find & Replace, Go To Line & Language Switcher', () => {
  const edPath = path.join(webRoot, 'src', 'features', 'astra', 'components', 'CodeEditor.jsx');
  assert.ok(fs.existsSync(edPath), 'CodeEditor.jsx must exist');
  const content = fs.readFileSync(edPath, 'utf8');
  assert.match(content, /handleReplaceOne/i, 'Must support single replacement');
  assert.match(content, /handleReplaceAll/i, 'Must support replace all occurrences');
  assert.match(content, /handleGoToLineSubmit/i, 'Must support Go To Line jumping');
  assert.match(content, /isLangSwitcherOpen/i, 'Must provide interactive language switcher modal');
  assert.match(content, /onCloseOtherTabs/i, 'Must support closing other tabs');
  assert.match(content, /onCloseAllTabs/i, 'Must support closing all open tabs');
});

test('Domain 4 — AI Assistant Implements Multi-Turn Stream, Context Pills & Step Details', () => {
  const aPath = path.join(webRoot, 'src', 'features', 'astra', 'components', 'AstraAssistant.jsx');
  assert.ok(fs.existsSync(aPath), 'AstraAssistant.jsx must exist');
  const content = fs.readFileSync(aPath, 'utf8');
  assert.match(content, /handleAddContextPill/i, 'Must inject context pills');
  assert.match(content, /@ActiveFile/i, 'Must support @ActiveFile context pill');
  assert.match(content, /@Project/i, 'Must support @Project context pill');
  assert.match(content, /@Terminal/i, 'Must support @Terminal context pill');
  assert.match(content, /expandedStep/i, 'Must support step detail accordion');
  assert.match(content, /handleResetSession/i, 'Must support session reset');
});

test('Domain 5 — Patch Review Implements Unified & Split Diff Views with Risk Breakdown', () => {
  const prPath = path.join(webRoot, 'src', 'features', 'astra', 'components', 'PatchReview.jsx');
  assert.ok(fs.existsSync(prPath), 'PatchReview.jsx must exist');
  const content = fs.readFileSync(prPath, 'utf8');
  assert.match(content, /diffMode/i, 'Must support unified vs split diff toggle');
  assert.match(content, /splitLeft/i, 'Must generate left original split diff pane');
  assert.match(content, /splitRight/i, 'Must generate right modified split diff pane');
  assert.match(content, /showRiskDetails/i, 'Must provide static analysis and risk breakdown');
  assert.match(content, /handleCopyDiff/i, 'Must support copying diff to clipboard');
});

test('Domain 6 — Terminal & Diagnostics Support History Navigation & Lint Problems', () => {
  const tPath = path.join(webRoot, 'src', 'features', 'astra', 'components', 'TerminalPanel.jsx');
  assert.ok(fs.existsSync(tPath), 'TerminalPanel.jsx must exist');
  const content = fs.readFileSync(tPath, 'utf8');
  assert.match(content, /commandHistory/i, 'Must maintain command history');
  assert.match(content, /handleKeyDown/i, 'Must bind ArrowUp/ArrowDown history navigation');
  assert.match(content, /WORKSPACE DIAGNOSTICS/i, 'Must render problems and diagnostics table');
  assert.match(content, /handleExportLogs/i, 'Must support exporting terminal logs');
});

test('Domain 7 — Git Management Implements Branching, History Log & Staging Batches', () => {
  const gPath = path.join(webRoot, 'src', 'features', 'astra', 'components', 'GitPanel.jsx');
  assert.ok(fs.existsSync(gPath), 'GitPanel.jsx must exist');
  const content = fs.readFileSync(gPath, 'utf8');
  assert.match(content, /handleCreateBranch/i, 'Must support new branch creation');
  assert.match(content, /handleStageAll/i, 'Must support stage all changes');
  assert.match(content, /handleUnstageAll/i, 'Must support unstage all changes');
  assert.match(content, /commitLog/i, 'Must render recent commit history log');
});

test('Domain 8 — Database Explorer Implements Click-To-Query, Templates & CSV Export', () => {
  const dPath = path.join(webRoot, 'src', 'features', 'astra', 'components', 'DatabasePanel.jsx');
  assert.ok(fs.existsSync(dPath), 'DatabasePanel.jsx must exist');
  const content = fs.readFileSync(dPath, 'utf8');
  assert.match(content, /handleSelectTable/i, 'Must support click-to-query on schema tables');
  assert.match(content, /SQL_TEMPLATES/i, 'Must provide pre-saved SQL templates');
  assert.match(content, /handleExportCsv/i, 'Must export query results to CSV');
  assert.match(content, /toggleSort/i, 'Must support result column sorting');
});

test('Domain 9 — API Client Implements Live Browser Fetch, Headers & GraphQL Mode', () => {
  const apiPath = path.join(webRoot, 'src', 'features', 'astra', 'components', 'ApiClientPanel.jsx');
  assert.ok(fs.existsSync(apiPath), 'ApiClientPanel.jsx must exist');
  const content = fs.readFileSync(apiPath, 'utf8');
  assert.match(content, /QUICK_ENDPOINTS/i, 'Must provide pre-saved local microservice presets');
  assert.match(content, /queryParams/i, 'Must support URL query parameters editor');
  assert.match(content, /graphqlQuery/i, 'Must support GraphQL queries and variables');
  assert.match(content, /fetch\(urlObj/i, 'Must execute live browser fetch requests');
  assert.match(content, /handleFormatJson/i, 'Must format JSON payloads');
});

test('Domain 10 — Deploy & Pipelines Implement Verification Gates, Secrets & Console Logs', () => {
  const depPath = path.join(webRoot, 'src', 'features', 'astra', 'components', 'DeployPanel.jsx');
  const pipePath = path.join(webRoot, 'src', 'features', 'astra', 'components', 'PipelinesPanel.jsx');
  assert.ok(fs.existsSync(depPath), 'DeployPanel.jsx must exist');
  assert.ok(fs.existsSync(pipePath), 'PipelinesPanel.jsx must exist');

  const depContent = fs.readFileSync(depPath, 'utf8');
  assert.match(depContent, /envVars/i, 'Must support environment variables and secrets');
  assert.match(depContent, /activeDeployStep/i, 'Must track multi-stage deployment release gates');

  const pipeContent = fs.readFileSync(pipePath, 'utf8');
  assert.match(pipeContent, /selectedStage/i, 'Must support clicking stage to view console logs');
  assert.match(pipeContent, /handleRerun/i, 'Must support pipeline rerun simulation');
});

test('Domain 11 — Settings & Zen Mode Support Live Microservice Pings & Shortcut Hiding', () => {
  const setPath = path.join(webRoot, 'src', 'features', 'astra', 'components', 'AstraSettingsPanel.jsx');
  const wsPath = path.join(webRoot, 'src', 'features', 'astra', 'AstraWorkspace.jsx');
  assert.ok(fs.existsSync(setPath), 'AstraSettingsPanel.jsx must exist');
  assert.ok(fs.existsSync(wsPath), 'AstraWorkspace.jsx must exist');

  const setContent = fs.readFileSync(setPath, 'utf8');
  assert.match(setContent, /pingAllServices/i, 'Must ping microservices for live status');
  assert.match(setContent, /Ctrl \+ B/i, 'Must document Zen Mode shortcut');

  const wsContent = fs.readFileSync(wsPath, 'utf8');
  assert.match(wsContent, /isZenMode/i, 'Must track Zen Mode state');
  assert.match(wsContent, /handleCloseAllTabs/i, 'Must handle batch tab closing');
});

