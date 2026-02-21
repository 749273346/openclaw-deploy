const fs = require('fs');
const path = require('path');
const os = require('os');

// Try to require axios from the skill directory
let axios;
try {
  axios = require('./skills/autonomous-daily-briefing/node_modules/axios');
} catch (e) {
  console.error('Error loading axios:', e.message);
  console.error('Please ensure dependencies are installed in skills/autonomous-daily-briefing');
  process.exit(1);
}

// Load configuration
const configPath = path.resolve(os.homedir(), '.openclaw/openclaw.json');
if (!fs.existsSync(configPath)) {
  console.error('Configuration file not found at', configPath);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const apiKey = config.llm && config.llm.apiKey;
const model = (config.llm && config.llm.model) || 'deepseek-chat';
const provider = (config.llm && config.llm.provider) || 'deepseek';

if (!apiKey) {
  console.error('API Key not found in configuration.');
  process.exit(1);
}

const readline = require('readline');

async function chat(message) {
  console.log(`🤖 OpenClaw (${provider}/${model}) is thinking...`);
  
  try {
    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: model,
        messages: [
          { role: "system", content: "You are OpenClaw, an autonomous AI agent system. You are helpful, precise, and friendly." },
          { role: "user", content: message }
        ],
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 30000
      }
    );

    const reply = response.data.choices[0].message.content;
    console.log('\n🦁 OpenClaw:');
    console.log(reply);
    
  } catch (error) {
    console.error('Error communicating with LLM:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

async function startInteractiveMode() {
  console.clear();
  console.log('\x1b[33m%s\x1b[0m', 'openclaw tui - local - agent main - session main');
  console.log('\x1b[90m%s\x1b[0m', 'session agent:main:main\n');
  console.log('你好！我是你的 AI 助手，刚刚启动。看起来这是我们的第一次对话。');
  console.log('输入 "exit" 或 "quit" 退出。\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\x1b[32m> \x1b[0m'
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      rl.close();
      process.exit(0);
      return;
    }
    if (input) {
      rl.pause();
      await chat(input);
      rl.resume();
    }
    rl.prompt();
  });
}

if (process.argv[2]) {
  chat(process.argv[2]);
} else {
  startInteractiveMode();
}
