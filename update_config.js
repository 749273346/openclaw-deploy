const fs = require('fs');
const path = require('path');
const os = require('os');

const configPath = path.resolve(os.homedir(), '.openclaw/openclaw.json');

try {
  let config = {};
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }

  config.llm = {
    provider: 'deepseek',
    apiKey: 'sk-831425073ca346618ca101f9f9290a25',
    model: 'deepseek-chat'
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('Successfully updated openclaw.json at', configPath);
} catch (error) {
  console.error('Error updating config:', error.message);
  process.exit(1);
}
