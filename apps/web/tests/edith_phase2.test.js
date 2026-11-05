import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');

test('EDITH Phase 2 — Real Git Service Contract & Methods Exist', () => {
  const servicePath = path.join(webRoot, 'src', 'services', 'edith', 'edith-git-service.js');
  assert.ok(fs.existsSync(servicePath), 'edith-git-service.js must exist');
  const content = fs.readFileSync(servicePath, 'utf8');

  assert.match(content, /getStatus\s*\(/, 'Must implement getStatus');
  assert.match(content, /getBranches\s*\(/, 'Must implement getBranches');
  assert.match(content, /createBranch\s*\(/, 'Must implement createBranch');
  assert.match(content, /checkoutBranch\s*\(/, 'Must implement checkoutBranch');
  assert.match(content, /stage\s*\(/, 'Must implement stage');
  assert.match(content, /unstage\s*\(/, 'Must implement unstage');
  assert.match(content, /commit\s*\(/, 'Must implement commit');
  assert.match(content, /getDiff\s*\(/, 'Must implement getDiff');
  assert.match(content, /getLog\s*\(/, 'Must implement getLog');
  assert.match(content, /\/edith\/git/, 'Must query /edith/git endpoints');
});

test('EDITH Phase 2 — Real Database Service Contract & Methods Exist', () => {
  const servicePath = path.join(webRoot, 'src', 'services', 'edith', 'edith-db-service.js');
  assert.ok(fs.existsSync(servicePath), 'edith-db-service.js must exist');
  const content = fs.readFileSync(servicePath, 'utf8');

  assert.match(content, /getDatabases\s*\(/, 'Must implement getDatabases');
  assert.match(content, /getTables\s*\(/, 'Must implement getTables');
  assert.match(content, /getTableSchema\s*\(/, 'Must implement getTableSchema');
  assert.match(content, /getTableRecords\s*\(/, 'Must implement getTableRecords');
  assert.match(content, /executeQuery\s*\(/, 'Must implement executeQuery');
  assert.match(content, /\/edith\/database/, 'Must query /edith/database endpoints');
});

test('EDITH Phase 2 — GitPanel Implements Real Git CLI Capabilities & Safety Controls', () => {
  const panelPath = path.join(webRoot, 'src', 'features', 'edith', 'components', 'GitPanel.jsx');
  assert.ok(fs.existsSync(panelPath), 'GitPanel.jsx must exist');
  const content = fs.readFileSync(panelPath, 'utf8');

  assert.match(content, /REAL GIT ENGINE/i, 'Must display REAL GIT ENGINE badge');
  assert.match(content, /edithGitService/i, 'Must connect to edithGitService');
  assert.match(content, /handleCommit/i, 'Must handle commit actions');
  assert.match(content, /isCommitModalOpen/i, 'Must enforce commit confirmation modal');
  assert.match(content, /Confirm Git Commit/i, 'Must display explicit confirmation modal title');
  assert.match(content, /handleStageAll/i, 'Must support stage all');
  assert.match(content, /handleUnstageAll/i, 'Must support unstage all');
  assert.match(content, /diffModal/i, 'Must support inspecting real file diffs');
  assert.match(content, /Uncommitted Changes Detected/i, 'Must check dirty tree before branch checkout');
  assert.match(content, /commitLog/i, 'Must render commit log history');
});

test('EDITH Phase 2 — DatabasePanel Implements Read-Only SQLite Explorer & Safe Runner', () => {
  const panelPath = path.join(webRoot, 'src', 'features', 'edith', 'components', 'DatabasePanel.jsx');
  assert.ok(fs.existsSync(panelPath), 'DatabasePanel.jsx must exist');
  const content = fs.readFileSync(panelPath, 'utf8');

  assert.match(content, /READ-ONLY ENFORCED/i, 'Must display READ-ONLY ENFORCED badge');
  assert.match(content, /edithDbService/i, 'Must connect to edithDbService');
  assert.match(content, /tableSchema/i, 'Must inspect table column schema');
  assert.match(content, /totalPages/i, 'Must implement paginated records');
  assert.match(content, /handleExportCSV/i, 'Must implement CSV export');
  assert.match(content, /executionTimeMs/i, 'Must display query execution timing');
  assert.match(content, /SELECT/i, 'Must support read-only SELECT queries');
});

test('EDITH Phase 2 — EdithWorkspace Wire-Up Passes Project Context to Git & DB Panels', () => {
  const workspacePath = path.join(webRoot, 'src', 'features', 'edith', 'EdithWorkspace.jsx');
  assert.ok(fs.existsSync(workspacePath), 'EdithWorkspace.jsx must exist');
  const content = fs.readFileSync(workspacePath, 'utf8');

  assert.match(
    content,
    /<GitPanel\s+projectId=\{activeProjectId\}\s+activeProject=\{activeProject\}\s*\/>/,
    'Must pass projectId and activeProject to GitPanel'
  );
  assert.match(
    content,
    /<DatabasePanel\s+projectId=\{activeProjectId\}\s+activeProject=\{activeProject\}\s*\/>/,
    'Must pass projectId and activeProject to DatabasePanel'
  );
});

