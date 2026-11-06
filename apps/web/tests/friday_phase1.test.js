import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');

test('BRAHMA Phase 1 — Locked Design Tokens Match Ground Truth', () => {
  const tokensPath = path.join(webRoot, 'src', 'design-system', 'tokens.css');
  assert.ok(fs.existsSync(tokensPath), 'tokens.css must exist');

  const content = fs.readFileSync(tokensPath, 'utf8');
  assert.match(content, /--brand-gold:\s*#F6C87A/i, '--brand-gold must be #F6C87A');
  assert.match(content, /--brand-gold-light:\s*#FFE5A7/i, '--brand-gold-light must be #FFE5A7');
  assert.match(content, /--brand-violet:\s*#8B5CF6/i, '--brand-violet must be #8B5CF6');
  assert.match(content, /--brand-cyan:\s*#06B6D4/i, '--brand-cyan must be #06B6D4');
  assert.match(content, /--brand-purple:\s*#A855F7/i, '--brand-purple must be #A855F7');
  assert.match(content, /--bg-base:\s*#0B0F1A/i, '--bg-base must be #0B0F1A');
  assert.match(content, /--bg-elevated:\s*#111827/i, '--bg-elevated must be #111827');
  assert.match(content, /--surface-card:\s*#1E1B3D/i, '--surface-card must be #1E1B3D');
  assert.match(content, /--text-primary:\s*#F7F7FB/i, '--text-primary must be #F7F7FB');
  assert.match(content, /--text-secondary:\s*#A7AEC2/i, '--text-secondary must be #A7AEC2');
  assert.match(content, /--border-default:\s*#30384D/i, '--border-default must be #30384D');
});

test('BRAHMA Phase 1 — Typography System Enforces Poppins UI and JetBrains Mono Code', () => {
  const typoPath = path.join(webRoot, 'src', 'design-system', 'typography.css');
  assert.ok(fs.existsSync(typoPath), 'typography.css must exist');

  const content = fs.readFileSync(typoPath, 'utf8');
  assert.match(content, /Poppins/, 'UI typography must specify Poppins');
  assert.match(content, /JetBrains Mono/, 'Code typography must specify JetBrains Mono');
});

test('BRAHMA Phase 1 — Glassmorphic Stylesheet Implements Backdrop Blur and Translucent Cards', () => {
  const glassPath = path.join(webRoot, 'src', 'design-system', 'glassmorphism.css');
  assert.ok(fs.existsSync(glassPath), 'glassmorphism.css must exist');

  const content = fs.readFileSync(glassPath, 'utf8');
  assert.match(content, /backdrop-filter:\s*blur/i, 'Must define backdrop blur');
  assert.match(content, /\.glass-card/, 'Must define .glass-card');
  assert.match(content, /\.glass-panel/, 'Must define .glass-panel');
  assert.match(content, /\.glass-input/, 'Must define .glass-input');
  assert.match(content, /\.glass-btn/, 'Must define .glass-btn');
});

test('BRAHMA Phase 1 — Animation Stylesheet Implements Gold Pulse, Shimmer, and Reduced Motion', () => {
  const animPath = path.join(webRoot, 'src', 'design-system', 'animations.css');
  assert.ok(fs.existsSync(animPath), 'animations.css must exist');

  const content = fs.readFileSync(animPath, 'utf8');
  assert.match(content, /@keyframes\s+goldGlowPulse/i, 'Must define goldGlowPulse animation');
  assert.match(content, /\.glass-shimmer/i, 'Must define glass-shimmer light sweep');
  assert.match(content, /@keyframes\s+fadeSlideUp/i, 'Must define fadeSlideUp entrance animation');
  assert.match(content, /@keyframes\s+aiThinkWave/i, 'Must define aiThinkWave thinking wave');
  assert.match(content, /prefers-reduced-motion/i, 'Must support prefers-reduced-motion');
});

test('FRIDAY Phase 1 — Production Vector Mark and Favicon Exist', () => {
  const fridaySvg = path.join(webRoot, 'public', 'brand', 'friday-mark.svg');
  const faviconSvg = path.join(webRoot, 'public', 'brand', 'favicon.svg');

  assert.ok(fs.existsSync(fridaySvg), 'friday-mark.svg must exist');
  assert.ok(fs.existsSync(faviconSvg), 'favicon.svg must exist');

  const fridayContent = fs.readFileSync(fridaySvg, 'utf8');
  assert.ok(fridayContent.startsWith('<svg'), 'friday-mark.svg must be a valid SVG file');
});

test('FRIDAY Phase 1 — Core Components & Services Exist', () => {
  const requiredFiles = [
    'src/components/common/Button.jsx',
    'src/components/common/Input.jsx',
    'src/components/common/Card.jsx',
    'src/components/common/Modal.jsx',
    'src/components/common/Badge.jsx',
    'src/components/common/LoadingSpinner.jsx',
    'src/components/common/EmptyState.jsx',
    'src/components/common/ErrorBoundary.jsx',
    'src/components/feedback/Toast.jsx',
    'src/components/navigation/FridayNavbar.jsx',
    'src/components/navigation/FridaySidebar.jsx',
    'src/components/layout/FridayShell.jsx',
    'src/context/AuthContext.jsx',
    'src/context/ThemeContext.jsx',
    'src/services/api-client.js',
    'src/services/auth-service.js',
    'src/services/conversation-service.js',
    'src/services/ai-service.js',
    'src/services/project-service.js',
    'src/services/system-service.js',
    'src/features/auth/AuthPage.jsx',
    'src/features/auth/LoginForm.jsx',
    'src/features/auth/RegisterForm.jsx',
    'src/features/dashboard/HomeDashboard.jsx',
    'src/features/chat/ChatWorkspace.jsx',
    'src/features/chat/CodeBlock.jsx',
    'src/features/chat/PromptComposer.jsx',
    'src/features/projects/ProjectsWorkspace.jsx',
    'src/features/projects/ProjectCard.jsx',
    'src/features/projects/CreateProjectModal.jsx',
    'src/features/files/FilesWorkspace.jsx',
    'src/features/settings/SettingsWorkspace.jsx',
    'src/app/App.jsx',
    'src/main.jsx'
  ];

  for (const relPath of requiredFiles) {
    const fullPath = path.join(webRoot, relPath);
    assert.ok(fs.existsSync(fullPath), `${relPath} must exist`);
  }
});

test('FRIDAY Phase 2 — EDITH Studio Activation and Routing in App', () => {
  const edithFeatureDir = path.join(webRoot, 'src', 'features', 'edith');
  const astraFeatureDir = path.join(webRoot, 'src', 'features', 'astra');
  assert.ok(fs.existsSync(edithFeatureDir) || fs.existsSync(astraFeatureDir), 'EDITH/ASTRA feature directory must exist');

  const appContent = fs.readFileSync(path.join(webRoot, 'src', 'app', 'App.jsx'), 'utf8');
  assert.ok(appContent.includes('EdithWorkspace') || appContent.includes('AstraWorkspace'), 'App.jsx must mount EdithWorkspace');
  assert.ok(appContent.includes('EdithLauncher') || appContent.includes('AstraLauncher'), 'App.jsx must mount EdithLauncher');
});

test('BRAHMA Phase 1 Defects — Settings Health Diagnostics bypasses /api/v1 prefix', () => {
  const apiClientContent = fs.readFileSync(path.join(webRoot, 'src', 'services', 'api-client.js'), 'utf8');
  assert.ok(apiClientContent.includes("endpoint.startsWith('/health')"), 'apiClient must recognize /health root route');
});

test('BRAHMA Phase 1 Defects — Dashboard Composer transfers prompt to ChatWorkspace', () => {
  const appContent = fs.readFileSync(path.join(webRoot, 'src', 'app', 'App.jsx'), 'utf8');
  assert.ok(appContent.includes('initialChatPrompt'), 'App.jsx must manage initialChatPrompt state');
  assert.ok(appContent.includes('onStartChat={handleStartChat}'), 'App.jsx must pass onStartChat to HomeDashboard');

  const chatContent = fs.readFileSync(path.join(webRoot, 'src', 'features', 'chat', 'ChatWorkspace.jsx'), 'utf8');
  assert.ok(chatContent.includes('initialPrompt'), 'ChatWorkspace must accept initialPrompt prop');
  assert.ok(chatContent.includes('onResetInitialPrompt'), 'ChatWorkspace must accept onResetInitialPrompt prop');
});

test('BRAHMA Phase 1 Defects — Global Search performs real-time filtering', () => {
  const appContent = fs.readFileSync(path.join(webRoot, 'src', 'app', 'App.jsx'), 'utf8');
  assert.ok(appContent.includes('filteredSearchItems'), 'App.jsx must compute filteredSearchItems');
  assert.ok(appContent.includes('No matching pages or tools found'), 'App.jsx must show empty state for search');
});

test('BRAHMA Phase 1 Defects — Files Workspace uses the shared real download service', () => {
  const filesContent = fs.readFileSync(path.join(webRoot, 'src', 'features', 'files', 'FilesWorkspace.jsx'), 'utf8');
  const serviceContent = fs.readFileSync(path.join(webRoot, 'src', 'services', 'file-service.js'), 'utf8');
  assert.ok(filesContent.includes('fileService.download('), 'FilesWorkspace must use the shared file download service');
  assert.ok(serviceContent.includes('URL.createObjectURL'), 'The shared download service must create a browser download URL');
  assert.ok(serviceContent.includes('a.download ='), 'The shared download service must trigger a browser download');
});

test('BRAHMA Phase 1 Defects — Forgot Password uses glass card notice instead of window.alert', () => {
  const loginContent = fs.readFileSync(path.join(webRoot, 'src', 'features', 'auth', 'LoginForm.jsx'), 'utf8');
  assert.ok(!loginContent.includes('alert('), 'LoginForm must not contain window.alert()');
  assert.ok(loginContent.includes('showForgotNotice'), 'LoginForm must use showForgotNotice state');
});

