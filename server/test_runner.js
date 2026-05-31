const http = require('http');
const { spawn } = require('child_process');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log("Starting server...");
  const server = spawn('node', ['server.js'], { cwd: __dirname });
  
  // Wait for server to start
  await new Promise(r => setTimeout(r, 2000));
  
  try {
    let passed = 0, failed = 0;
    const assert = (condition, msg) => {
      if(condition) { console.log("✅ PASSED:", msg); passed++; }
      else { console.error("❌ FAILED:", msg); failed++; }
    };

    // Test 1: Access Admin API without token -> 401
    const res1 = await request({ port: 8082, path: '/api/admin/status' });
    assert(res1.status === 401, "Admin API protected without token (Expected 401)");

    // Test 2: Login with wrong password -> 401
    const res2 = await request({ port: 8082, path: '/api/admin/login', method: 'POST', headers: {'Content-Type':'application/json'} }, JSON.stringify({password: 'wrongpass'}));
    assert(res2.status === 401, "Admin Login rejects wrong password (Expected 401)");

    // Test 3: Login with correct password -> 200 + token
    const res3 = await request({ port: 8082, path: '/api/admin/login', method: 'POST', headers: {'Content-Type':'application/json'} }, JSON.stringify({password: 'admin123'}));
    assert(res3.status === 200, "Admin Login accepts correct password (Expected 200)");
    
    let token = '';
    try {
      const data = JSON.parse(res3.body);
      token = data.token;
      assert(!!token, "Admin Login returns JWT token");
    } catch(e) {
      assert(false, "Admin Login did not return valid JSON or token");
    }

    // Test 4: Access Admin API with token -> 200
    const res4 = await request({ port: 8082, path: '/api/admin/status', headers: { 'Authorization': `Bearer ${token}` } });
    assert(res4.status === 200, "Admin API grants access with valid token (Expected 200)");

    // Test 5: Rate Limiting
    console.log("Testing Rate Limits (Sending 12 rapid requests to /api/generate)...");
    let hitRateLimit = false;
    for(let i=1; i<=12; i++) {
      const res5 = await request({ port: 8082, path: '/api/generate', method: 'POST', headers: {'Content-Type':'application/json'} }, JSON.stringify({toolId: 'test'}));
      if(res5.status === 429) {
        hitRateLimit = true;
      }
    }
    assert(hitRateLimit, "Rate Limiting blocks excessive requests (Expected 429)");

    // Test 6: Verify .env is protected from direct browser access
    const res6 = await request({ port: 8082, path: '/.env' });
    assert(res6.status === 404, ".env file is protected from static serving (Expected 404)");

    console.log(`\nTests Complete. Passed: ${passed}, Failed: ${failed}`);

  } catch(e) {
    console.error("Test execution error:", e);
  } finally {
    server.kill();
  }
}

runTests();
