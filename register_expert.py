import json
import os

config_path = '/root/.openclaw/openclaw.json'
prompt_path = '/programs/openclaw-deploy/OpenClaw_Expert/OpenClaw-Expert-Agent.md'

try:
    with open(prompt_path, 'r') as f:
        system_prompt = f.read()

    with open(config_path, 'r') as f:
        config = json.load(f)

    if 'agents' not in config:
        config['agents'] = {}

    # Define the expert agent configuration
    # We include both 'systemPrompt' and 'instructions' as potential keys since the schema is not fully known.
    # We also set the model to GLM-4V for vision capabilities.
    expert_config = {
        "model": {
            "primary": "custom-api-zhipu-ai/glm-4v"
        },
        "systemPrompt": system_prompt,
        "instructions": system_prompt,
        "workspace": "/programs/openclaw-deploy/OpenClaw_Expert"
    }

    config['agents']['expert'] = expert_config

    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)

    print("Successfully registered 'expert' agent in openclaw.json")

except Exception as e:
    print(f"Error registering agent: {e}")
