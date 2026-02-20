import subprocess
import os
import sys

prompt_path = '/programs/openclaw-deploy/OpenClaw_Expert/OpenClaw-Expert-Agent.md'

try:
    with open(prompt_path, 'r') as f:
        system_prompt = f.read()
except FileNotFoundError:
    print(f"Error: Prompt file not found at {prompt_path}")
    sys.exit(1)

# The user wants the agent to start its mission.
# We will prepend the system prompt to the user's initial instruction.
# This forces the agent to adopt the persona for this session.

initial_instruction = "请根据你的角色设定，开始第一轮的全球 AI 技术扫描，并告诉我你的发现和进化建议。"

full_message = f"{system_prompt}\n\n---\n\n{initial_instruction}"

# We use the 'main' agent (or default) but override its behavior with the prompt.
# We also specify the recipient number to create a distinct session.
# Using a different number (e.g., +15550199) creates a new session context.

cmd = [
    "openclaw", "agent",
    "--agent", "main",
    "--to", "+15550199",
    "--message", full_message
]

print("Launching OpenClaw Expert Agent...")
try:
    subprocess.run(cmd, check=True)
except subprocess.CalledProcessError as e:
    print(f"Error running agent: {e}")
