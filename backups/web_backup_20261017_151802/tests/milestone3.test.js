import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');

test('Milestone 3 — ChatWorkspace Implements Full Conversation Interface & Backend APIs', () => {
  const chatPath = path.join(webRoot, 'src', 'features', 'chat', 'ChatWorkspace.jsx');
  assert.ok(fs.existsSync(chatPath), 'ChatWorkspace.jsx must exist');

  const content = fs.readFileSync(chatPath, 'utf8');

  // Verify conversation sidebar controls
  assert.match(content, /handleNewChat/i, 'Must support starting a new chat');
  assert.match(content, /api\.listConversations/i, 'Must fetch conversation history from backend');
  assert.match(content, /api\.createConversation/i, 'Must create conversation on backend');
  assert.match(content, /api\.getConversation/i, 'Must fetch conversation messages');
  assert.match(content, /api\.sendMessage/i, 'Must persist messages to database');
  assert.match(content, /api\.createAiTask/i, 'Must dispatch AI tasks to BRAHMA Core');

  // Verify message actions & controls
  assert.match(content, /handleCopy/i, 'Must support copying message text');
  assert.match(content, /handleStopGeneration/i, 'Must provide stop generation control');
  assert.match(content, /MarkdownText/i, 'Must render markdown and code blocks in messages');
  assert.match(content, /sidebarOpen/i, 'Must support responsive sidebar toggling');
  assert.match(content, /Shift\+Enter/i, 'Must support multiline textarea with Shift+Enter');
});

test('Milestone 3 — CodeBlock and MarkdownText Renderers Handle Formatting & Copying', () => {
  const codeBlockPath = path.join(webRoot, 'src', 'components', 'ui', 'CodeBlock.jsx');
  const markdownPath = path.join(webRoot, 'src', 'components', 'ui', 'MarkdownText.jsx');

  assert.ok(fs.existsSync(codeBlockPath), 'CodeBlock.jsx must exist');
  assert.ok(fs.existsSync(markdownPath), 'MarkdownText.jsx must exist');

  const codeContent = fs.readFileSync(codeBlockPath, 'utf8');
  assert.match(codeContent, /var\(--font-code\)/i, 'Must use JetBrains Mono for code font');
  assert.match(codeContent, /handleCopy/i, 'Must have copy-to-clipboard functionality');

  const mdContent = fs.readFileSync(markdownPath, 'utf8');
  assert.match(mdContent, /CodeBlock/i, 'Must embed CodeBlock for fenced code snippets');
  assert.match(mdContent, /renderInline/i, 'Must handle inline markdown formatting');
});

test('Milestone 3 — ResearchWorkspace Implements Querying, Findings, and Citations', () => {
  const researchPath = path.join(webRoot, 'src', 'features', 'research', 'ResearchWorkspace.jsx');
  assert.ok(fs.existsSync(researchPath), 'ResearchWorkspace.jsx must exist');

  const content = fs.readFileSync(researchPath, 'utf8');
  assert.match(content, /CATEGORIES/i, 'Must offer source category filters');
  assert.match(content, /api\.createAiTask/i, 'Must invoke backend AI task for research');
  assert.match(content, /keyFindings/i, 'Must present structured key findings');
  assert.match(content, /sources/i, 'Must display cited knowledge sources');
});

test('Milestone 3 — DocumentsWorkspace Implements Upload, Indexing, and Inspection', () => {
  const docsPath = path.join(webRoot, 'src', 'features', 'documents', 'DocumentsWorkspace.jsx');
  assert.ok(fs.existsSync(docsPath), 'DocumentsWorkspace.jsx must exist');

  const content = fs.readFileSync(docsPath, 'utf8');
  assert.match(content, /handleFileUpload/i, 'Must support file uploads');
  assert.match(content, /activePreviewDoc/i, 'Must support document inspection drawer');
  assert.match(content, /concepts/i, 'Must extract and show architectural concepts');
});

test('Milestone 3 — ImagesWorkspace Implements Prompt Controls & Honest Generative Art', () => {
  const imgPath = path.join(webRoot, 'src', 'features', 'images', 'ImagesWorkspace.jsx');
  assert.ok(fs.existsSync(imgPath), 'ImagesWorkspace.jsx must exist');

  const content = fs.readFileSync(imgPath, 'utf8');
  assert.match(content, /ASPECT_RATIOS/i, 'Must support aspect ratio selection');
  assert.match(content, /STYLES/i, 'Must provide style presets');
  assert.match(content, /api\.createAiTask/i, 'Must dispatch image tasks to backend');
  assert.match(content, /Backend Integrity/i, 'Must honestly disclose generation status without fake photographs');
});

test('Milestone 3 — ProjectsWorkspace Implements Database CRUD & Project Drawer', () => {
  const projPath = path.join(webRoot, 'src', 'features', 'projects', 'ProjectsWorkspace.jsx');
  assert.ok(fs.existsSync(projPath), 'ProjectsWorkspace.jsx must exist');

  const content = fs.readFileSync(projPath, 'utf8');
  assert.match(content, /api\.listProjects/i, 'Must load projects from database');
  assert.match(content, /api\.deleteProject/i, 'Must support deleting projects');
  assert.match(content, /CreateProjectModal/i, 'Must support creating new projects');
  assert.match(content, /selectedProject/i, 'Must include project detail overview drawer');
});

test('Milestone 3 — MemoryWorkspace Implements Transparency, Filters, and Export', () => {
  const memPath = path.join(webRoot, 'src', 'features', 'memory', 'MemoryWorkspace.jsx');
  assert.ok(fs.existsSync(memPath), 'MemoryWorkspace.jsx must exist');

  const content = fs.readFileSync(memPath, 'utf8');
  assert.match(content, /memoryPaused/i, 'Must provide pause memory toggle');
  assert.match(content, /handleExportJson/i, 'Must support exporting memories as JSON');
  assert.match(content, /handleAddMemory/i, 'Must support adding custom memory rules');
  assert.match(content, /User Controlled Memory/i, 'Must feature transparent user disclosures');
});

test('Milestone 3 — AgentsWorkspace Exposes Specialist Roster & Disclosures', () => {
  const agentsPath = path.join(webRoot, 'src', 'features', 'agents', 'AgentsWorkspace.jsx');
  assert.ok(fs.existsSync(agentsPath), 'AgentsWorkspace.jsx must exist');

  const content = fs.readFileSync(agentsPath, 'utf8');
  assert.match(content, /SPECIALIST_AGENTS/i, 'Must define specialist product agents');
  assert.match(content, /capabilities/i, 'Must disclose capabilities for each agent');
  assert.match(content, /permissions/i, 'Must disclose permissions boundary');
  assert.match(content, /handleStartChat/i, 'Must support starting conversations with agents');
});

test('Milestone 3 — SettingsWorkspace Protects Secrets & Exposes System Health', () => {
  const settingsPath = path.join(webRoot, 'src', 'features', 'settings', 'SettingsWorkspace.jsx');
  assert.ok(fs.existsSync(settingsPath), 'SettingsWorkspace.jsx must exist');

  const content = fs.readFileSync(settingsPath, 'utf8');
  assert.match(content, /Cosmic Dark/i, 'Must show locked cosmic dark theme');
  assert.match(content, /reducedMotion/i, 'Must offer reduced motion accessibility control');
  assert.match(content, /Secrets Policy/i, 'Must safely configure providers without exposing raw API keys');
  assert.match(content, /Live Architecture/i, 'Must show verified live service ports');
});

test('Milestone 3 — AstraLauncher Implements Celestial Arrow, Descriptor, & Security Status', () => {
  const astraPath = path.join(webRoot, 'src', 'features', 'astra', 'AstraLauncher.jsx');
  assert.ok(fs.existsSync(astraPath), 'AstraLauncher.jsx must exist');

  const content = fs.readFileSync(astraPath, 'utf8');
  assert.match(content, /astra-mark\.svg/i, 'Must render distinct ASTRA celestial arrow mark');
  assert.match(content, /CODE · CREATE · DEPLOY/i, 'Must display approved descriptor');
  assert.match(content, /api\.checkAstraSecurityStatus/i, 'Must query live ASTRA security boundary');
  assert.match(content, /navigate\('astra\/workspace'\)/i, 'Must offer accessible enter action');
});

test('Milestone 3 — App.jsx Integrates All Screen Views Into React Routing', () => {
  const appPath = path.join(webRoot, 'src', 'app', 'App.jsx');
  assert.ok(fs.existsSync(appPath), 'App.jsx must exist');

  const content = fs.readFileSync(appPath, 'utf8');
  assert.match(content, /ChatWorkspace/i, 'Must route ChatWorkspace');
  assert.match(content, /ResearchWorkspace/i, 'Must route ResearchWorkspace');
  assert.match(content, /DocumentsWorkspace/i, 'Must route DocumentsWorkspace');
  assert.match(content, /ImagesWorkspace/i, 'Must route ImagesWorkspace');
  assert.match(content, /ProjectsWorkspace/i, 'Must route ProjectsWorkspace');
  assert.match(content, /MemoryWorkspace/i, 'Must route MemoryWorkspace');
  assert.match(content, /AgentsWorkspace/i, 'Must route AgentsWorkspace');
  assert.match(content, /SettingsWorkspace/i, 'Must route SettingsWorkspace');
  assert.match(content, /AstraLauncher/i, 'Must route AstraLauncher');
});
