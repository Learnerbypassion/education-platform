const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('../src/app');
dotenv.config();

const PORT = 5050; // Use a different port for testing

const runTests = async () => {
  console.log('⏳ Starting API Verification...');
  
  // 1. Connect to Database
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/edu-platform');
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('❌ Database connection failed. Please ensure MongoDB is running or provide a valid MONGO_URI.');
    console.error(err.message);
    process.exit(1);
  }

  // 2. Start server
  const server = app.listen(PORT, () => {
    console.log(`✅ Test server running on port ${PORT}`);
  });

  // 3. Test Endpoints
  const endpoints = [
    { path: '/api/health', method: 'GET', expectedStatus: 200 },
    { path: '/api/courses', method: 'GET', expectedStatus: 200 },
    { path: '/api/auth/google', method: 'GET', expectedStatus: 302 }, // Should redirect to Google OAuth
    { path: '/api/auth/github', method: 'GET', expectedStatus: 302 }, // Should redirect to GitHub OAuth
  ];

  let passed = 0;

  for (const endpoint of endpoints) {
    await new Promise((resolve) => {
      const options = {
        hostname: 'localhost',
        port: PORT,
        path: endpoint.path,
        method: endpoint.method,
      };

      const req = http.request(options, (res) => {
        if (res.statusCode === endpoint.expectedStatus || (res.statusCode >= 200 && res.statusCode < 400)) {
          console.log(`✅ [PASS] ${endpoint.method} ${endpoint.path} -> Status: ${res.statusCode}`);
          passed++;
        } else {
          console.log(`❌ [FAIL] ${endpoint.method} ${endpoint.path} -> Expected ${endpoint.expectedStatus}, got ${res.statusCode}`);
        }
        resolve();
      });

      req.on('error', (e) => {
        console.log(`❌ [FAIL] ${endpoint.method} ${endpoint.path} -> Error: ${e.message}`);
        resolve();
      });

      req.end();
    });
  }

  console.log(`\n🎉 Verification Complete: ${passed}/${endpoints.length} passed.`);
  
  // Clean up
  server.close();
  mongoose.connection.close();
  process.exit(passed === endpoints.length ? 0 : 1);
};

runTests();
