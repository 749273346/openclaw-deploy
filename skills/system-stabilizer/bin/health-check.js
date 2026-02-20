#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dns = require('dns');

const REPORT = {
  status: 'healthy',
  checks: []
};

function check(name, fn) {
  try {
    const result = fn();
    REPORT.checks.push({ name, status: 'pass', details: result });
    console.log(`✅ ${name}: PASS`);
  } catch (e) {
    REPORT.status = 'degraded';
    REPORT.checks.push({ name, status: 'fail', error: e.message });
    console.log(`❌ ${name}: FAIL - ${e.message}`);
  }
}

async function runChecks() {
  console.log('🏥 Running System Health Check...');

  // 1. Node Version
  check('Node Environment', () => {
    const nodeVer = process.version;
    if (!nodeVer.startsWith('v')) throw new Error('Invalid node version');
    return nodeVer;
  });

  // 2. Critical Configuration
  check('Configuration Integrity', () => {
    const configPath = path.resolve(process.env.HOME, '.openclaw/openclaw.json');
    if (!fs.existsSync(configPath)) throw new Error('openclaw.json missing');
    JSON.parse(fs.readFileSync(configPath, 'utf8')); // Validate JSON
    return 'Config valid';
  });

  // 3. Memory Storage
  check('Memory Storage', () => {
    const memoryDir = path.resolve(__dirname, '../../elite-longterm-memory/memory');
    if (!fs.existsSync(memoryDir)) throw new Error('Memory directory missing');
    return 'Memory accessible';
  });

  // 4. Network Connectivity (Simulated ping)
  check('Network Connectivity', () => {
    try {
      execSync('ping -c 1 8.8.8.8', { stdio: 'ignore', timeout: 2000 });
      return 'Connected';
    } catch (e) {
      throw new Error('Network unreachable');
    }
  });

  // 5. Skill Registry Integrity
  check('Skill Registry', () => {
    const registryPath = path.resolve(__dirname, '../../skill-optimizer/skill-registry.json');
    if (fs.existsSync(registryPath)) {
      JSON.parse(fs.readFileSync(registryPath, 'utf8'));
      return 'Registry valid';
    }
    return 'Registry not found (optional)';
  });

  console.log(`\n📊 System Status: ${REPORT.status.toUpperCase()}`);
  
  if (REPORT.status !== 'healthy') {
    console.log('⚠️ Issues detected. Initiating self-healing protocol...');
    try {
      execSync(`node ${path.join(__dirname, 'self-heal.js')}`, { stdio: 'inherit' });
    } catch (e) {
      console.error('Self-healing failed:', e.message);
    }
  }
}

runChecks();
