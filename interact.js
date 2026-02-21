const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const readline = require('readline');

// Load TUI libraries
const chalk = require('chalk');
const boxen = require('boxen');
const ora = require('ora');
const figlet = require('figlet');
const axios = require('axios');

// Load configuration
const configPath = path.resolve(os.homedir(), '.openclaw/openclaw.json');
if (!fs.existsSync(configPath)) {
  console.error(chalk.red('Configuration file not found at ' + configPath));
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const apiKey = config.llm && config.llm.apiKey;
const model = (config.llm && config.llm.model) || 'deepseek-chat';
const provider = (config.llm && config.llm.provider) || 'deepseek';

if (!apiKey) {
  console.error(chalk.red('API Key not found in configuration.'));
  process.exit(1);
}

// Define available tools
const TOOLS = [
  {
    name: 'openclaw control',
    description: 'Control mouse and keyboard. Commands: move <x> <y>, click [left|right], type <text>, press <key>, screen size, open <url|app>, wait <ms>',
    usage: 'EXECUTE: openclaw control <command> <args> | openclaw control ...'
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
    description: 'Manage calendar events. Commands: list [date], add <time> <title>, report (weekly summary)',
    usage: 'EXECUTE: openclaw calendar <list|add|report> [args]'
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
IMPORTANT: You MUST always reply in Simplified Chinese (简体中文) unless the user explicitly asks for another language.

AVAILABLE TOOLS:
${TOOLS.map(t => `- ${t.name}: ${t.description} (Usage: "${t.usage}")`).join('\n')}

TO USE A TOOL:
If the user asks you to perform an action that requires a tool, your response MUST start with "EXECUTE: " followed by the command.
You can chain multiple commands using " && " or " | ".

Example:
User: "Move the mouse to 500, 500 then click"
You: "EXECUTE: openclaw control move 500 500 && openclaw control click left"

User: "Type 'Hello' and press Enter"
You: "EXECUTE: openclaw control type Hello && openclaw control press Enter"

If no tool is needed, just reply normally in Chinese.
`;

async function executeCommand(commandStr) {
  console.log(chalk.cyan(`⚡ Executing: ${commandStr}`));
  
  // Split commands by ' && ' or ' | '
  const commands = commandStr.split(/ && | \| /);
  
  for (const cmdStr of commands) {
      if (!cmdStr.trim()) continue;
      
      const parts = cmdStr.trim().split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);
      
      let spawnCmd, spawnArgs;
      
      if (cmd === 'openclaw') {
        spawnCmd = 'node';
        spawnArgs = ['openclaw', ...args];
      } else {
          console.log(chalk.yellow('⚠️  Command not allowed for security reasons:', cmd));
          continue;
      }

      await new Promise((resolve) => {
        const child = spawn(spawnCmd, spawnArgs, { cwd: __dirname, stdio: 'inherit', shell: true });
        child.on('close', (code) => {
          resolve(code);
        });
      });
  }
}

// Store conversation history
let conversationHistory = [
  { role: "system", content: SYSTEM_PROMPT }
];

async function chat(message) {
  // Add user message to history
  conversationHistory.push({ role: "user", content: message });
  
  const spinner = ora(`OpenClaw (${provider}/${model}) is thinking...`).start();
  
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
    spinner.stop(); // Stop spinner before outputting
    
    // Add assistant reply to history
    conversationHistory.push({ role: "assistant", content: reply });
    
    // Check for tool execution
    if (reply.startsWith('EXECUTE:')) {
        const commandToRun = reply.replace('EXECUTE:', '').trim();
        await executeCommand(commandToRun);
    } else {
        // Use boxen for AI reply
        console.log(boxen(reply, {
            title: '🦁 OpenClaw',
            titleAlignment: 'center',
            padding: 1,
            margin: 1,
            borderStyle: 'round',
            borderColor: 'cyan'
        }));
    }
    
  } catch (error) {
    spinner.fail('Error communicating with LLM');
    if (error.response) {
      console.error(chalk.red(`Status: ${error.response.status}`));
      console.error(chalk.red(JSON.stringify(error.response.data, null, 2)));
    } else {
      console.error(chalk.red(error.message));
    }
    // Remove the failed user message from history so we can retry
    conversationHistory.pop();
  }
}

async function startInteractiveMode() {
  console.clear();
  
  // Fancy title
  console.log(chalk.magenta(figlet.textSync('OpenClaw', { horizontalLayout: 'full' })));
  
  console.log(boxen(`Session: ${new Date().toLocaleString()}\nAgent: Main\nMode: Interactive`, {
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'yellow'
  }));
  
  console.log(chalk.green('你好！我是你的 AI 助手。输入 "exit" 或 "quit" 退出。'));

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.green('User > ')
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
      await chat(input);
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
