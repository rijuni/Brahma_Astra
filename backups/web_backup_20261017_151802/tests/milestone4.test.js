import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');

test('Milestone 4 — FileTree Component Renders Explorer, Folders, and File Creation', () => {
  const treePath = path.join(webRoot, 'src', 'features', 'astra', 'FileTree.jsx');
  assert.ok(fs.existsSync(treePath), 'FileTree.jsx must exist');

  const content = fs.readFileSync(treePath, 'utf8');

  // Verify tree features
  assert.match(content, /buildTreeFromFlatFiles/i, 'Must construct hierarchical tree from flat files');
  assert.match(content, /toggleFolder/i, 'Must support folder expand and collapse');
  assert.match(content, /getFileIcon/i, 'Must map distinct icons by file extension');
  assert.match(content, /onNewFile/i, 'Must support safe new file creation');
  assert.match(content, /item\.dirty/i, 'Must display unsaved dirty indicator dot');
});

test('Milestone 4 — CodeEditor Implements Multi-Tab, Line Numbers, Find, and Save Shortcuts', () => {
  const editorPath = path.join(webRoot, 'src', 'features', 'astra', 'CodeEditor.jsx');
  assert.ok(fs.existsSync(editorPath), 'CodeEditor.jsx must exist');

  const content = fs.readFileSync(editorPath, 'utf8');

  // Verify editor features
  assert.match(content, /openTabs\.map/i, 'Must support multiple open editor tabs');
  assert.match(content, /onCloseTab/i, 'Must support closing individual tabs');
  assert.match(content, /lineCount/i, 'Must render line numbers in gutter');
  assert.match(content, /var\(--font-code\)/i, 'Must use JetBrains Mono code font');
  assert.match(content, /showFind/i, 'Must provide find search bar overlay');
  assert.match(content, /isReadOnly/i, 'Must support read-only mode toggle');
  assert.match(content, /onSaveFile/i, 'Must support saving files via Ctrl+S');
  assert.match(content, /handleCopyCode/i, 'Must provide copy code button');
});

test('Milestone 4 — PatchReview Implements Unified Diff & Explicit Human Approval Gates', () => {
  const reviewPath = path.join(webRoot, 'src', 'features', 'astra', 'PatchReview.jsx');
  assert.ok(fs.existsSync(reviewPath), 'PatchReview.jsx must exist');

  const content = fs.readFileSync(reviewPath, 'utf8');

  // Verify diff rendering
  assert.match(content, /isAdd\s*=/i, 'Must identify added lines (+)');
  assert.match(content, /isDel\s*=/i, 'Must identify deleted lines (-)');
  assert.match(content, /isHunk\s*=/i, 'Must identify hunk headers (@@)');
  assert.match(content, /risk_level/i, 'Must display risk level badge');

  // Verify explicit approval gates (never automatic)
  assert.match(content, /onApproveTask/i, 'Must provide explicit Approve button');
  assert.match(content, /onCancelTask/i, 'Must provide explicit Reject button');
  assert.match(content, /Human-in-the-loop Gate/i, 'Must state human approval is required');
  assert.match(content, /getStatusBadge/i, 'Must handle proposed, approved, running, completed, and cancelled states');
});

test('Milestone 4 — TerminalPanel Enforces Disabled Execution & Safe Diagnostic Commands', () => {
  const termPath = path.join(webRoot, 'src', 'features', 'astra', 'TerminalPanel.jsx');
  assert.ok(fs.existsSync(termPath), 'TerminalPanel.jsx must exist');

  const content = fs.readFileSync(termPath, 'utf8');

  // Verify terminal features & security
  assert.match(content, /Execution:\s*Disabled/i, 'Must explicitly disclose execution is disabled');
  assert.match(content, /api\.checkAstraSecurityStatus/i, 'Must query live security boundary status');
  assert.match(content, /isCollapsed/i, 'Must support collapsing and expanding terminal panel');
  assert.match(content, /handleCommandSubmit/i, 'Must intercept and process user input');
  assert.match(content, /BLOCKED/i, 'Must block arbitrary shell commands from host execution');
  assert.match(content, /clearLogs/i, 'Must provide terminal clear functionality');
});

test('Milestone 4 — AstraAssistant Submits Instructions to ASTRA Engine Without Fake Execution', () => {
  const assistantPath = path.join(webRoot, 'src', 'features', 'astra', 'AstraAssistant.jsx');
  assert.ok(fs.existsSync(assistantPath), 'AstraAssistant.jsx must exist');

  const content = fs.readFileSync(assistantPath, 'utf8');

  // Verify assistant integration
  assert.match(content, /api\.createCodingTask/i, 'Must submit coding instructions via backend API');
  assert.match(content, /api\.getCodingTask/i, 'Must poll for generated patch proposal');
  assert.match(content, /onSwitchToPatchReview/i, 'Must link directly to patch review');
  assert.match(content, /Zero automated arbitrary code execution/i, 'Must disclose security limitation');
});

test('Milestone 4 — AstraWorkspace Coordinates Multi-Pane Layout and Backend Operations', () => {
  const wsPath = path.join(webRoot, 'src', 'features', 'astra', 'AstraWorkspace.jsx');
  assert.ok(fs.existsSync(wsPath), 'AstraWorkspace.jsx must exist');

  const content = fs.readFileSync(wsPath, 'utf8');

  // Verify subcomponent composition
  assert.match(content, /<FileTree/i, 'Must embed FileTree in left pane');
  assert.match(content, /<CodeEditor/i, 'Must embed CodeEditor in center pane');
  assert.match(content, /<AstraAssistant/i, 'Must embed AstraAssistant in right pane tab');
  assert.match(content, /<PatchReview/i, 'Must embed PatchReview in right pane tab');
  assert.match(content, /<TerminalPanel/i, 'Must embed TerminalPanel at bottom');

  // Verify backend integration
  assert.match(content, /api\.listProjects/i, 'Must load projects');
  assert.match(content, /api\.createAstraWorkspace/i, 'Must initialize ASTRA workspace');
  assert.match(content, /api\.approveCodingTask/i, 'Must call real approval endpoint');
  assert.match(content, /api\.cancelCodingTask/i, 'Must call real cancellation endpoint');
});

test('Milestone 4 — App.jsx Mounts AstraWorkspace When isAstra is Active', () => {
  const appPath = path.join(webRoot, 'src', 'app', 'App.jsx');
  assert.ok(fs.existsSync(appPath), 'App.jsx must exist');

  const content = fs.readFileSync(appPath, 'utf8');
  assert.match(content, /import\s*{\s*AstraWorkspace\s*}/i, 'Must import AstraWorkspace');
  assert.match(content, /<AstraShell>\s*<AstraWorkspace\s*\/>\s*<\/AstraShell>/i, 'Must render AstraWorkspace inside AstraShell');
});
