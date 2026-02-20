import json
import os

config_path = '/root/.openclaw/openclaw.json'

try:
    with open(config_path, 'r') as f:
        config = json.load(f)

    # Add Zhipu model to agent defaults
    if 'agents' in config and 'defaults' in config['agents'] and 'models' in config['agents']['defaults']:
        config['agents']['defaults']['models']['custom-api-zhipu-ai/glm-4v'] = {}
    
    # Write back
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)
    
    print("Successfully added Zhipu AI model to agent defaults.")

except Exception as e:
    print(f"Error updating config: {e}")
