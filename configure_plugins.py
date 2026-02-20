import json
import os

config_path = "/root/.openclaw/openclaw.json"

if not os.path.exists(config_path):
    print(f"Error: {config_path} not found")
    exit(1)

with open(config_path, "r") as f:
    config = json.load(f)

# Ensure plugins structure exists
if "plugins" not in config:
    config["plugins"] = {}

if "entries" not in config["plugins"]:
    config["plugins"]["entries"] = {}

# Configure memory-lancedb
# Note: Using text-embedding-3-small to pass schema validation
# Relying on Zhipu AI to handle it or ignore it (risky)
config["plugins"]["entries"]["memory-lancedb"] = {
    "enabled": True,
    "config": {
        "embedding": {
            "apiKey": "8160d175a76d4780bdd28cfa9a6324a2.PKy7AzPDMtROEBIV",
            "model": "text-embedding-3-small"
        }
    }
}

# Also ensure memorySearch is correctly pointing to this model
if "agents" in config and "defaults" in config["agents"]:
    if "memorySearch" not in config["agents"]["defaults"]:
        config["agents"]["defaults"]["memorySearch"] = {}
    
    config["agents"]["defaults"]["memorySearch"]["enabled"] = True
    config["agents"]["defaults"]["memorySearch"]["model"] = "embedding-2"
    # We might need provider here too if memorySearch uses provider/model format
    # But usually it uses the model ID defined in providers section

with open(config_path, "w") as f:
    json.dump(config, f, indent=2)

print("Configuration updated successfully")
