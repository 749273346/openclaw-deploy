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

const { spawn } = require('child_process');

// Define available tools
const TOOLS = [
  {
    name: 'openclaw control',
    description: 'Control mouse and keyboard. Commands: move <x> <y>, click [left|right], type <text>, press <key>, screen size, open <url|app>',
    usage: 'EXECUTE: openclaw control <command> <args>'
  },
  {
    name: 'openclaw video',
    description: 'Create/Edit videos. Commands: check, create',
    usage: 'EXECUTE: openclaw video <command>'
  },
  {
    name: 'openclaw briefing',
    description: 'Generate daily AI & Tech briefing',
    usage: 'EXECUTE: openclaw briefing'
  },
  {
    name: 'openclaw summarize',
    description: 'Summarize a web page or YouTube video',
    usage: 'EXECUTE: openclaw summarize <url>'
  },
  {
    name: 'openclaw calendar',
    description: 'Manage local calendar. Commands: list, add <event>',
    usage: 'EXECUTE: openclaw calendar <command> <args>'
  },
  {
    name: 'openclaw health',
    description: 'Run system health checks',
    usage: 'EXECUTE: openclaw health'
  },
  {
    name: 'openclaw heal',
    description: 'Attempt to self-heal system issues',
    usage: 'EXECUTE: openclaw heal'
  }
];

const SYSTEM_PROMPT = `You are OpenClaw, an autonomous AI agent system with capability to control the computer and create videos.
You are helpful, precise, and friendly.

AVAILABLE TOOLS:
${TOOLS.map(t => `- ${t.name}: ${t.description} (Usage: "${t.usage}")`).join('\n')}

TO USE A TOOL:
If the user asks you to perform an action that requires a tool, your response MUST start with "EXECUTE: " followed by the command.
Example:
User: "Move the mouse to 500, 500"
You: "EXECUTE: openclaw control move 500 500"

User: "Type 'Hello'"
You: "EXECUTE: openclaw control type Hello"

If no tool is needed, just reply normally.
`;

async function executeCommand(commandStr) {
  console.log(`\x1b[36m⚡ Executing: ${commandStr}\x1b[0m`);
  const parts = commandStr.trim().split(' ');
  const cmd = parts[0];
  const args = parts.slice(1);
  
  // For security, we only allow 'openclaw' commands here for now, or direct node calls if we want
  // But our prompt generates "openclaw control ...", so we need to handle that.
  // Since we are running 'node openclaw ...' in the shell, we can just spawn 'node' with 'openclaw' as first arg
  // Or simpler: just spawn the command directly if it is 'openclaw'.
  
  // Actually, 'openclaw' is a node script in the current dir.
  // We should resolve it.
  
  let spawnCmd, spawnArgs;
  
  if (cmd === 'openclaw') {
    spawnCmd = 'node';
    spawnArgs = ['openclaw', ...args];
  } else {
      // Fallback for safety - don't execute arbitrary commands unless explicitly allowed
      console.log('⚠️  Command not allowed for security reasons:', cmd);
      return;
  }

  return new Promise((resolve) => {
    const child = spawn(spawnCmd, spawnArgs, { cwd: __dirname, stdio: 'inherit', shell: true });
    child.on('close', (code) => {
      resolve(code);
    });
  });
}

const readline = require('readline');

// Store conversation history
let conversationHistory = [
  { role: "system", content: SYSTEM_PROMPT }
];

async function chat(message) {
  // Add user message to history
  conversationHistory.push({ role: "user", content: message });
  
  console.log(`🤖 OpenClaw (${provider}/${model}) is thinking...`);
  
  try {
    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: model,
        messages: conversationHistory,
        stream: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 60000 // Increased timeout
      }
    );

    const reply = response.data.choices[0].message.content;
    
    // Add assistant reply to history
    conversationHistory.push({ role: "assistant", content: reply });
    
    // Check for tool execution
    if (reply.startsWith('EXECUTE:')) {
        const commandToRun = reply.replace('EXECUTE:', '').trim();
        await executeCommand(commandToRun);
    } else {
        console.log('\n🦁 OpenClaw:');
        console.log(reply);
    }
    
  } catch (error) {
    console.error('Error communicating with LLM:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    // Remove the failed user message from history so we can retry
    conversationHistory.pop();
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
      // Pause input while processing
      rl.pause();
      await chat(input);
      // Resume input
      rl.resume();
    }
    rl.prompt();
  });
}

if (require.main === module) {
  if (process.argv[2]) {
    chat(process.argv[2]);
  } else {
    startInteractiveMode();
  }
}

module.exports = { chat, startInteractiveMode };
