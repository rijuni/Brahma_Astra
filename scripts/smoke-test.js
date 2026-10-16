/**
 * BRAHMA + ASTRA Smoke Test
 *
 * Verifies live service health and security configuration over HTTP.
 * This script only performs non-mutating HTTP requests and NEVER starts, stops,
 * or terminates any service processes.
 */

const http = require('http');

const REQUEST_TIMEOUT_MS = 3000;

function checkEndpoint({ name, url, validator }) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', chunk => { rawData += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(rawData);
        } catch (e) {
          // Non-JSON response
        }

        try {
          const validation = validator(res.statusCode, json, rawData);
          if (validation.pass) {
            resolve({
              name,
              url,
              pass: true,
              message: validation.message || `HTTP ${res.statusCode} OK`
            });
          } else {
            resolve({
              name,
              url,
              pass: false,
              message: validation.message || `Validation failed on response (HTTP ${res.statusCode})`
            });
          }
        } catch (err) {
          resolve({
            name,
            url,
            pass: false,
            message: `Validation exception: ${err.message}`
          });
        }
      });
    });

    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy();
      resolve({
        name,
        url,
        pass: false,
        message: `Request timed out after ${REQUEST_TIMEOUT_MS}ms`
      });
    });

    req.on('error', (err) => {
      let reason = err.message;
      if (err.code === 'ECONNREFUSED') {
        reason = 'Connection refused (service not running)';
      }
      resolve({
        name,
        url,
        pass: false,
        message: reason
      });
    });

    req.end();
  });
}

const checks = [
  {
    name: 'Application API Liveness',
    url: 'http://localhost:3000/health/live',
    validator: (status, data) => {
      if (status !== 200) return { pass: false, message: `Expected HTTP 200, got ${status}` };
      if (!data || data.status !== 'ok') return { pass: false, message: `Expected status "ok", got "${data ? data.status : 'null'}"` };
      return { pass: true, message: `status="${data.status}"` };
    }
  },
  {
    name: 'Application API Readiness & Database',
    url: 'http://localhost:3000/health/ready',
    validator: (status, data) => {
      if (status !== 200) return { pass: false, message: `Expected HTTP 200, got ${status}` };
      if (!data || data.status !== 'ready' || data.database !== 'connected') {
        return { pass: false, message: `Expected ready & database connected, got status="${data?.status}", database="${data?.database}"` };
      }
      return { pass: true, message: `status="${data.status}", database="${data.database}"` };
    }
  },
  {
    name: 'BRAHMA Core Liveness',
    url: 'http://localhost:8001/health/live',
    validator: (status, data) => {
      if (status !== 200) return { pass: false, message: `Expected HTTP 200, got ${status}` };
      if (!data || data.status !== 'ok') return { pass: false, message: `Expected status "ok", got "${data?.status}"` };
      return { pass: true, message: `status="${data.status}"` };
    }
  },
  {
    name: 'BRAHMA Core Readiness',
    url: 'http://localhost:8001/health/ready',
    validator: (status, data) => {
      if (status !== 200) return { pass: false, message: `Expected HTTP 200, got ${status}` };
      if (!data || !data.ready) return { pass: false, message: `Expected ready=true, got ready=${data?.ready}` };
      return { pass: true, message: `ready=${data.ready}, provider="${data.provider}"` };
    }
  },
  {
    name: 'ASTRA Engine Liveness',
    url: 'http://localhost:8002/health/live',
    validator: (status, data) => {
      if (status !== 200) return { pass: false, message: `Expected HTTP 200, got ${status}` };
      if (!data || data.status !== 'ok') return { pass: false, message: `Expected status "ok", got "${data?.status}"` };
      return { pass: true, message: `status="${data.status}"` };
    }
  },
  {
    name: 'ASTRA Engine Readiness',
    url: 'http://localhost:8002/health/ready',
    validator: (status, data) => {
      if (status !== 200) return { pass: false, message: `Expected HTTP 200, got ${status}` };
      if (!data || data.status !== 'ready') return { pass: false, message: `Expected status "ready", got "${data?.status}"` };
      return { pass: true, message: `status="${data.status}"` };
    }
  },
  {
    name: 'ASTRA Runner Liveness',
    url: 'http://localhost:8003/health/live',
    validator: (status, data) => {
      if (status !== 200) return { pass: false, message: `Expected HTTP 200, got ${status}` };
      if (!data || data.status !== 'ok') return { pass: false, message: `Expected status "ok", got "${data?.status}"` };
      return { pass: true, message: `status="${data.status}"` };
    }
  },
  {
    name: 'ASTRA Runner Security Policy (Disabled Execution)',
    url: 'http://localhost:8003/api/v1/security-status',
    validator: (status, data) => {
      if (status !== 200) return { pass: false, message: `Expected HTTP 200, got ${status}` };
      if (!data) return { pass: false, message: 'Empty response body' };

      const mode = data.execution_mode;
      const verified = data.verified;

      if (mode !== 'disabled') {
        return {
          pass: false,
          message: `Security violation: Expected execution_mode="disabled", but got "${mode}"`
        };
      }

      if (verified !== true) {
        return {
          pass: false,
          message: `Expected verified=true, but got ${verified}`
        };
      }

      return {
        pass: true,
        message: `execution_mode="${mode}", verified=${verified}`
      };
    }
  }
];

async function main() {
  console.log('===============================================================');
  console.log('  BRAHMA + ASTRA — Live Services HTTP Smoke Test');
  console.log('===============================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  for (const check of checks) {
    const result = await checkEndpoint(check);
    const tag = result.pass ? '[PASS]' : '[FAIL]';
    console.log(`${tag} ${result.name}`);
    console.log(`       URL:    ${result.url}`);
    console.log(`       Result: ${result.message}\n`);

    if (result.pass) {
      passedCount++;
    } else {
      failedCount++;
    }
  }

  console.log('===============================================================');
  console.log(`  Summary: ${passedCount} passed, ${failedCount} failed (${checks.length} total checks)`);
  console.log('===============================================================');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main();
