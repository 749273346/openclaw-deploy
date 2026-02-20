import json
import os

config_path = '/root/.openclaw/openclaw.json'

try:
    with open(config_path, 'r') as f:
        config = json.load(f)

    # Define Zhipu provider
    zhipu_provider = {
        "baseUrl": "https://open.bigmodel.cn/api/paas/v4",
        "apiKey": "8160d175a76d4780bdd28cfa9a6324a2.PKy7AzPDMtROEBIV",
        "api": "openai-completions",
        "models": [
            {
                "id": "glm-4v",
                "name": "GLM-4V (Vision)",
                "input": ["text", "image"],
                "contextWindow": 128000,
                "maxTokens": 4096
            }
        ]
    }

    # Add to providers
    if 'models' not in config:
        config['models'] = {'providers': {}}
    if 'providers' not in config['models']:
        config['models']['providers'] = {}
    
    config['models']['providers']['custom-api-zhipu-ai'] = zhipu_provider
    
    # Write back
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)
    
    print("Successfully added Zhipu AI provider to config.")

except Exception as e:
    print(f"Error updating config: {e}")
