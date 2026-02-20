import json
import os

config_path = '/root/.openclaw/openclaw.json'

try:
    with open(config_path, 'r') as f:
        config = json.load(f)

    if 'agents' in config and 'expert' in config['agents']:
        del config['agents']['expert']
        print("Removed 'expert' agent from openclaw.json")
    else:
        print("'expert' agent not found in config")

    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)

except Exception as e:
    print(f"Error updating config: {e}")
