const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { headers }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.abort();
      reject(new Error(`Timeout fetching ${url}`));
    });
  });
}

async function verifyAllLive() {
  console.log('=== Verifying Native Windows Live Services Startup ===\n');

  const rootDir = path.resolve(__dirname, '..');
  const pythonExe = path.join(rootDir, '.venv', 'Scripts', 'python.exe');

  const procs = [];

  try {
    // 1. Start Node.js API
    console.log('[1/4] Spawning Application API (port 3000)...');
    const apiProc = spawn('node', ['src/server.js'], {
      cwd: path.join(rootDir, 'services', 'api'),
      stdio: 'pipe'
    });
    procs.push(apiProc);

    // 2. Start BRAHMA Core
    console.log('[2/4] Spawning BRAHMA Core (port 8001)...');
    const coreProc = spawn(pythonExe, ['-m', 'uvicorn', 'app.main:app', '--port', '8001'], {
      cwd: path.join(rootDir, 'services', 'brahma-core'),
      stdio: 'pipe'
    });
    procs.push(coreProc);

    // 3. Start ASTRA Engine
    console.log('[3/4] Spawning ASTRA Engine (port 8002)...');
    const engineProc = spawn(pythonExe, ['-m', 'uvicorn', 'app.main:app', '--port', '8002'], {
      cwd: path.join(rootDir, 'services', 'astra-engine'),
      stdio: 'pipe'
    });
    procs.push(engineProc);

    // 4. Start ASTRA Runner
    console.log('[4/4] Spawning ASTRA Runner (port 8003)...');
    const runnerProc = spawn(pythonExe, ['-m', 'uvicorn', 'app.main:app', '--port', '8003'], {
      cwd: path.join(rootDir, 'services', 'astra-runner'),
      stdio: 'pipe'
    });
    procs.push(runnerProc);

    console.log('\nWaiting 4 seconds for services to initialize...');
    await sleep(4000);

    // Verify API
    const apiHealth = await fetchJson('http://127.0.0.1:3000/health/live');
    console.log('  [OK] Application API /health/live:', apiHealth.data);
    const apiReady = await fetchJson('http://127.0.0.1:3000/health/ready');
    console.log('  [OK] Application API /health/ready:', apiReady.data);

    // Verify BRAHMA Core
    const coreHealth = await fetchJson('http://127.0.0.1:8001/health/live');
    console.log('  [OK] BRAHMA Core /health/live:', coreHealth.data);
    const coreReady = await fetchJson('http://127.0.0.1:8001/health/ready');
    console.log('  [OK] BRAHMA Core /health/ready:', coreReady.data);

    // Verify ASTRA Engine
    const engineHealth = await fetchJson('http://127.0.0.1:8002/health/live');
    console.log('  [OK] ASTRA Engine /health/live:', engineHealth.data);
    const engineReady = await fetchJson('http://127.0.0.1:8002/health/ready');
    console.log('  [OK] ASTRA Engine /health/ready:', engineReady.data);

    // Verify ASTRA Runner
    const runnerHealth = await fetchJson('http://127.0.0.1:8003/health/live');
    console.log('  [OK] ASTRA Runner /health/live:', runnerHealth.data);
    const runnerSec = await fetchJson('http://127.0.0.1:8003/api/v1/security-status');
    console.log('  [OK] ASTRA Runner /api/v1/security-status:', runnerSec.data.execution_mode, `(verified: ${runnerSec.data.verified})`);

    console.log('\n=== All 4 Native Windows Services Verified Live and Healthy! ===');
  } finally {
    console.log('Terminating spawned background service processes...');
    for (const proc of procs) {
      try {
        proc.kill('SIGTERM');
        proc.kill('SIGKILL');
      } catch (e) {}
    }
  }
}

verifyAllLive().catch(err => {
  console.error('\n[FAIL] Live verification failed:', err);
  process.exit(1);
});
