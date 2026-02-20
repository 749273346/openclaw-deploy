import subprocess
import os
import sys

# Paths
expert_prompt_path = '/programs/openclaw-deploy/OpenClaw_Expert/OpenClaw-Expert-Agent.md'
evolution_file_path = '/programs/openclaw-deploy/OpenClaw_Expert/OpenClaw-Evolutionary-Loop.md'

# Load expert persona
try:
    with open(expert_prompt_path, 'r') as f:
        expert_prompt = f.read()
except FileNotFoundError:
    print(f"Error: Expert prompt file not found at {expert_prompt_path}")
    sys.exit(1)

# Load document to evaluate
try:
    with open(evolution_file_path, 'r') as f:
        evolution_content = f.read()
except FileNotFoundError:
    print(f"Error: Evolution file not found at {evolution_file_path}")
    sys.exit(1)

# Construct the message
# Format: [Expert Persona]\n\n---\n\n[Instruction]\n\n[Document Content]
message = f"""
{expert_prompt}

---

请评价以下关于 OpenClaw 进化循环的设计文档。作为 OpenClaw 专家，请分析其可行性、潜在风险以及改进建议。

---
{evolution_content}
"""

# Command to run the agent
# Using "main" agent but with the full persona prompt injected.
cmd = [
    "openclaw", "agent",
    "--agent", "main",
    "--message", message,
    "--to", "+15550201", # New session for evaluation
    "--thinking", "medium"
]

print("Sending evaluation request to OpenClaw Expert (via main agent)...")
try:
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    stdout, stderr = process.communicate()
    
    print("Agent Output:")
    print(stdout)
    
    if stderr:
        print("Agent Stderr:")
        print(stderr)
        
    if process.returncode != 0:
        print(f"Process exited with code {process.returncode}")

except Exception as e:
    print(f"Error running agent: {e}")
