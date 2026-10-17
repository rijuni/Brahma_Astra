import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, '..');

test('Milestone 1 — CSS Design Tokens Match Locked Values', () => {
  const tokensCssPath = path.join(webRoot, 'src', 'design-system', 'tokens.css');
  assert.ok(fs.existsSync(tokensCssPath), 'tokens.css must exist');
  
  const content = fs.readFileSync(tokensCssPath, 'utf8');
  
  // BRAHMA Locked Tokens
  assert.match(content, /--brand-gold:\s*#F6C87A/i, 'Locked --brand-gold must be #F6C87A');
  assert.match(content, /--brand-gold-light:\s*#FFE5A7/i, 'Locked --brand-gold-light must be #FFE5A7');
  assert.match(content, /--brand-violet:\s*#8B5CF6/i, 'Locked --brand-violet must be #8B5CF6');
  assert.match(content, /--brand-cyan:\s*#06B6D4/i, 'Locked --brand-cyan must be #06B6D4');
  assert.match(content, /--brand-purple:\s*#A855F7/i, 'Locked --brand-purple must be #A855F7');
  assert.match(content, /--bg-base:\s*#0B0F1A/i, 'Locked --bg-base must be #0B0F1A');
  assert.match(content, /--bg-elevated:\s*#111827/i, 'Locked --bg-elevated must be #111827');
  assert.match(content, /--surface-card:\s*#1E1B3D/i, 'Locked --surface-card must be #1E1B3D');
  assert.match(content, /--text-primary:\s*#F7F7FB/i, 'Locked --text-primary must be #F7F7FB');
  assert.match(content, /--text-secondary:\s*#A7AEC2/i, 'Locked --text-secondary must be #A7AEC2');
  assert.match(content, /--border-default:\s*#30384D/i, 'Locked --border-default must be #30384D');

  // ASTRA Product-Scoped Tokens
  assert.match(content, /--astra-bg:\s*#070A18/i, 'Locked --astra-bg must be #070A18');
  assert.match(content, /--astra-surface:\s*#0D1428/i, 'Locked --astra-surface must be #0D1428');
  assert.match(content, /--astra-panel:\s*#101B35/i, 'Locked --astra-panel must be #101B35');
  assert.match(content, /--astra-electric-blue:\s*#38BDF8/i, 'Locked --astra-electric-blue must be #38BDF8');
  assert.match(content, /--astra-violet:\s*#8B5CF6/i, 'Locked --astra-violet must be #8B5CF6');
  assert.match(content, /--astra-cyan:\s*#22D3EE/i, 'Locked --astra-cyan must be #22D3EE');
});

test('Milestone 1 — Typography System Enforces Poppins and JetBrains Mono', () => {
  const typoPath = path.join(webRoot, 'src', 'design-system', 'typography.css');
  assert.ok(fs.existsSync(typoPath), 'typography.css must exist');

  const content = fs.readFileSync(typoPath, 'utf8');
  assert.match(content, /Poppins/, 'UI font must be Poppins');
  assert.match(content, /JetBrains Mono/, 'Code font must be JetBrains Mono');
});

test('Milestone 1 — Production Vector SVG Brand Assets Exist and are Valid', () => {
  const brahmaSvg = path.join(webRoot, 'public', 'brand', 'brahma-mark.svg');
  const astraSvg = path.join(webRoot, 'public', 'brand', 'astra-mark.svg');
  const faviconSvg = path.join(webRoot, 'public', 'brand', 'favicon.svg');

  assert.ok(fs.existsSync(brahmaSvg), 'brahma-mark.svg must exist');
  assert.ok(fs.existsSync(astraSvg), 'astra-mark.svg must exist');
  assert.ok(fs.existsSync(faviconSvg), 'favicon.svg must exist');

  const brahmaContent = fs.readFileSync(brahmaSvg, 'utf8');
  const astraContent = fs.readFileSync(astraSvg, 'utf8');

  assert.ok(brahmaContent.startsWith('<svg'), 'brahma-mark.svg must be valid SVG');
  assert.ok(astraContent.startsWith('<svg'), 'astra-mark.svg must be valid SVG');
});

test('Milestone 1 — Frontend Foundation Built Output Exists and is Clean', () => {
  const distHtml = path.join(webRoot, 'dist', 'index.html');
  assert.ok(fs.existsSync(distHtml), 'dist/index.html must exist from build');
  
  const htmlContent = fs.readFileSync(distHtml, 'utf8');
  assert.match(htmlContent, /BRAHMA \+ ASTRA/, 'Built HTML must contain brand title');
});

test('Milestone 1 — Shared Components and Layout Shells are Exported', () => {
  const buttonPath = path.join(webRoot, 'src', 'components', 'ui', 'Button.jsx');
  const inputPath = path.join(webRoot, 'src', 'components', 'ui', 'Input.jsx');
  const cardPath = path.join(webRoot, 'src', 'components', 'ui', 'Card.jsx');
  const modalPath = path.join(webRoot, 'src', 'components', 'ui', 'Modal.jsx');
  const brahmaShell = path.join(webRoot, 'src', 'components', 'layout', 'BrahmaShell.jsx');
  const astraShell = path.join(webRoot, 'src', 'components', 'layout', 'AstraShell.jsx');

  assert.ok(fs.existsSync(buttonPath), 'Button.jsx exists');
  assert.ok(fs.existsSync(inputPath), 'Input.jsx exists');
  assert.ok(fs.existsSync(cardPath), 'Card.jsx exists');
  assert.ok(fs.existsSync(modalPath), 'Modal.jsx exists');
  assert.ok(fs.existsSync(brahmaShell), 'BrahmaShell.jsx exists');
  assert.ok(fs.existsSync(astraShell), 'AstraShell.jsx exists');
});
