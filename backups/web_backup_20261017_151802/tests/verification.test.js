import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');

test('Verification — Production Build Artifacts and Asset Bundles Integrity', () => {
  const distDir = path.join(webRoot, 'dist');
  const indexHtml = path.join(distDir, 'index.html');
  const assetsDir = path.join(distDir, 'assets');

  assert.ok(fs.existsSync(indexHtml), 'dist/index.html must exist from production build');
  assert.ok(fs.existsSync(assetsDir), 'dist/assets directory must exist');

  const htmlContent = fs.readFileSync(indexHtml, 'utf8');
  assert.match(htmlContent, /<title>BRAHMA \+ ASTRA/i, 'Index HTML must have approved title');
  assert.match(htmlContent, /<script type="module" crossorigin/i, 'Must contain compiled JS entry bundle');
  assert.match(htmlContent, /<link rel="stylesheet" crossorigin/i, 'Must contain compiled CSS bundle');

  const assets = fs.readdirSync(assetsDir);
  const jsBundle = assets.find(f => f.endsWith('.js'));
  const cssBundle = assets.find(f => f.endsWith('.css'));

  assert.ok(jsBundle, 'Compiled JS bundle must exist');
  assert.ok(cssBundle, 'Compiled CSS bundle must exist');

  const jsSize = fs.statSync(path.join(assetsDir, jsBundle)).size;
  const cssSize = fs.statSync(path.join(assetsDir, cssBundle)).size;

  assert.ok(jsSize > 100000, 'JS bundle must contain compiled application logic');
  assert.ok(cssSize > 2000, 'CSS bundle must contain design tokens and styles');
});

test('Verification — Full Navigation & Routing Coverage Across All Approved Screens', () => {
  const appPath = path.join(webRoot, 'src', 'app', 'App.jsx');
  assert.ok(fs.existsSync(appPath), 'App.jsx must exist');
  const appCode = fs.readFileSync(appPath, 'utf8');

  const approvedRoutes = [
    'login',
    'signup',
    'home',
    'chat',
    'research',
    'documents',
    'images',
    'projects',
    'memory',
    'agents',
    'settings',
    'astra-launcher'
  ];

  for (const route of approvedRoutes) {
    assert.ok(
      appCode.includes(`'${route}'`) || appCode.includes(`"${route}"`),
      `Route '${route}' must be handled in App.jsx routing switch`
    );
  }

  // Verify ASTRA Dedicated Route
  assert.match(appCode, /if\s*\(\s*isAstra\s*\)/i, 'Must route isAstra dedicated workspace inside AstraShell');
});

test('Verification — API Client Standard Error Handling & Network Resilience', async () => {
  const apiPath = path.join(webRoot, 'src', 'services', 'api.js');
  assert.ok(fs.existsSync(apiPath), 'api.js must exist');

  const { ApiError, api } = await import(`file://${apiPath}`);

  // Test ApiError class constructor
  const err = new ApiError('Not found', 404, 'NOT_FOUND', { resource: 'Project' });
  assert.strictEqual(err.name, 'ApiError');
  assert.strictEqual(err.status, 404);
  assert.strictEqual(err.code, 'NOT_FOUND');
  assert.deepStrictEqual(err.details, { resource: 'Project' });
  assert.strictEqual(err.message, 'Not found');

  // Verify client methods exist
  assert.strictEqual(typeof api.login, 'function', 'api.login must be defined');
  assert.strictEqual(typeof api.register, 'function', 'api.register must be defined');
  assert.strictEqual(typeof api.logout, 'function', 'api.logout must be defined');
  assert.strictEqual(typeof api.getMe, 'function', 'api.getMe must be defined');
  assert.strictEqual(typeof api.listProjects, 'function', 'api.listProjects must be defined');
  assert.strictEqual(typeof api.createProject, 'function', 'api.createProject must be defined');
  assert.strictEqual(typeof api.deleteProject, 'function', 'api.deleteProject must be defined');
  assert.strictEqual(typeof api.listConversations, 'function', 'api.listConversations must be defined');
  assert.strictEqual(typeof api.createConversation, 'function', 'api.createConversation must be defined');
  assert.strictEqual(typeof api.sendMessage, 'function', 'api.sendMessage must be defined');
  assert.strictEqual(typeof api.createAiTask, 'function', 'api.createAiTask must be defined');
  assert.strictEqual(typeof api.createCodingTask, 'function', 'api.createCodingTask must be defined');
  assert.strictEqual(typeof api.approveCodingTask, 'function', 'api.approveCodingTask must be defined');
  assert.strictEqual(typeof api.cancelCodingTask, 'function', 'api.cancelCodingTask must be defined');
  assert.strictEqual(typeof api.checkAstraSecurityStatus, 'function', 'api.checkAstraSecurityStatus must be defined');
});

test('Verification — Secrets Protection: No API Keys or Internal Secrets Exposed', () => {
  const srcDir = path.join(webRoot, 'src');

  function checkDirForSecrets(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        checkDirForSecrets(fullPath);
      } else if (entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) {
        const fileContent = fs.readFileSync(fullPath, 'utf8');

        // Verify no raw hardcoded keys or secret environment variables leaked to client
        assert.ok(!fileContent.includes('sk-proj-'), `File ${entry.name} must not contain raw OpenAI keys`);
        assert.ok(!fileContent.includes('claude-3-5-sonnet-key'), `File ${entry.name} must not contain Anthropic keys`);
        assert.ok(!fileContent.includes('dev_internal_service_key'), `File ${entry.name} must not contain internal service keys`);
        assert.ok(!fileContent.includes('dev_jwt_secret_change_in_production'), `File ${entry.name} must not contain JWT secrets`);
      }
    }
  }

  checkDirForSecrets(srcDir);
});

test('Verification — Accessibility & Reduced Motion Support in CSS System', () => {
  const globalsCss = path.join(webRoot, 'src', 'design-system', 'globals.css');
  assert.ok(fs.existsSync(globalsCss), 'globals.css must exist');

  const content = fs.readFileSync(globalsCss, 'utf8');

  // Verify reduced-motion media query
  assert.match(content, /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/i, 'Must support prefers-reduced-motion');

  // Verify visible focus rings for keyboard navigation
  assert.match(content, /:focus-visible/i, 'Must specify visible focus indicator');

  // Verify font antialiasing
  assert.match(content, /-webkit-font-smoothing:\s*antialiased/i, 'Must enable smooth font antialiasing');
});

test('Verification — Execution Security Boundary Enforced in ASTRA Runner & IDE', () => {
  const runnerSecurityPath = path.join(webRoot, '..', '..', 'services', 'astra-runner', 'app', 'config.py');
  assert.ok(fs.existsSync(runnerSecurityPath), 'astra-runner config.py must exist');

  const configContent = fs.readFileSync(runnerSecurityPath, 'utf8');
  assert.match(configContent, /execution_mode:\s*str\s*=\s*Field\(\s*default="disabled"/i, 'Default execution_mode must be "disabled"');

  // Verify ASTRA Workspace components strictly enforce safety
  const termPath = path.join(webRoot, 'src', 'features', 'astra', 'TerminalPanel.jsx');
  const termContent = fs.readFileSync(termPath, 'utf8');
  assert.match(termContent, /Execution:\s*Disabled/i, 'Terminal must show disabled execution mode');
  assert.match(termContent, /Arbitrary host command.*cannot be executed/i, 'Must actively reject dangerous execution');
});
