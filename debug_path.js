const os = require('os');
const path = require('path');
const fs = require('fs');

const home = os.homedir();
console.log('Home directory:', home);

const configDir = path.resolve(home, '.openclaw');
console.log('Config dir:', configDir);
console.log('Config dir exists:', fs.existsSync(configDir));

const configPath = path.resolve(home, '.openclaw/openclaw.json');
console.log('Config path:', configPath);
console.log('Config file exists:', fs.existsSync(configPath));

if (fs.existsSync(configPath)) {
  try {
    const content = fs.readFileSync(configPath, 'utf8');
    console.log('Config content:', content);
  } catch (e) {
    console.log('Error reading config:', e.message);
  }
}
