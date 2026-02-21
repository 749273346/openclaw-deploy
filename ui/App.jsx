const React = require('react');
const { useState, useEffect, useRef } = require('react');
const { Box, Text, useInput, useApp, Newline } = require('ink');
const TextInput = require('ink-text-input').default || require('ink-text-input');
const Spinner = require('ink-spinner').default || require('ink-spinner');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { getDailyTheme } = require('./theme');
const Header = require('./components/Header');
const MessageList = require('./components/MessageList');

// Load configuration
const configPath = path.resolve(os.homedir(), '.openclaw/openclaw.json');
let config = {};
if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
}
const apiKey = config.llm && config.llm.apiKey;
const model = (config.llm && config.llm.model) || 'deepseek-chat';
const provider = (config.llm && config.llm.provider) || 'deepseek';

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

const App = () => {
    const theme = getDailyTheme();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('Ready');
    const { exit } = useApp();
    const [conversationHistory, setConversationHistory] = useState([
        { role: "system", content: SYSTEM_PROMPT }
    ]);

    const executeCommand = async (commandStr) => {
        setStatus(`Executing: ${commandStr}`);
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
                setMessages(prev => [...prev, { role: 'system', content: `⚠️ Command not allowed: ${cmd}` }]);
                continue;
            }

            await new Promise((resolve) => {
                const child = spawn(spawnCmd, spawnArgs, { cwd: process.cwd(), shell: true });
                
                child.stdout.on('data', (data) => {
                    const output = data.toString().trim();
                    if (output) {
                         setMessages(prev => [...prev, { role: 'system', content: output }]);
                    }
                });

                child.stderr.on('data', (data) => {
                     const output = data.toString().trim();
                     if (output) {
                         setMessages(prev => [...prev, { role: 'system', content: `Error: ${output}` }]);
                     }
                });

                child.on('close', (code) => {
                    resolve(code);
                });
            });
        }
        setStatus('Ready');
    };

    const handleSubmit = async (value) => {
        if (!value.trim()) return;
        if (value.trim().toLowerCase() === 'exit') {
            exit();
            process.exit(0);
        }

        const newMessages = [...messages, { role: 'user', content: value }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);
        setStatus('Thinking...');

        const newHistory = [...conversationHistory, { role: 'user', content: value }];
        setConversationHistory(newHistory);

        try {
            if (!apiKey) {
                throw new Error('API Key not found in ~/.openclaw/openclaw.json');
            }

            const response = await axios.post(
                'https://api.deepseek.com/chat/completions',
                {
                    model: model,
                    messages: newHistory,
                    stream: false
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    timeout: 60000
                }
            );

            const reply = response.data.choices[0].message.content;
            
            // Check for tool execution
            if (reply.startsWith('EXECUTE:')) {
                const commandToRun = reply.replace('EXECUTE:', '').trim();
                setMessages(prev => [...prev, { role: 'assistant', content: `Executing: ${commandToRun}` }]);
                await executeCommand(commandToRun);
                // Add to history but maybe show a summary in UI?
                // For now, let's add the tool execution result to history if possible, or just the assistant's intent.
                // The tool output is already added to messages as 'system'.
                setConversationHistory(prev => [...prev, { role: 'assistant', content: reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
                setConversationHistory(prev => [...prev, { role: 'assistant', content: reply }]);
            }

        } catch (error) {
            const errorMsg = error.response ? 
                `Error ${error.response.status}: ${JSON.stringify(error.response.data)}` : 
                error.message;
            setMessages(prev => [...prev, { role: 'system', content: `Error: ${errorMsg}` }]);
        } finally {
            setIsLoading(false);
            setStatus('Ready');
        }
    };

    return (
        <Box flexDirection="column" height="100%" padding={1}>
            <Header theme={theme} />
            
            <Box flexGrow={1} borderStyle={theme.borderStyle} borderColor={theme.borderColor} padding={1}>
                <MessageList messages={messages} theme={theme} />
            </Box>

            <Box marginTop={1}>
                {isLoading ? (
                    <Text color={theme.spinnerColor}>
                        <Spinner type="dots" /> {status}
                    </Text>
                ) : (
                    <Box>
                        <Text bold color={theme.titleColor}>{'> '}</Text>
                        <TextInput 
                            value={input} 
                            onChange={setInput} 
                            onSubmit={handleSubmit} 
                        />
                    </Box>
                )}
            </Box>
            
            <Box marginTop={1}>
                <Text color="gray" dimColor>Press Ctrl+C to exit</Text>
            </Box>
        </Box>
    );
};

module.exports = App;
