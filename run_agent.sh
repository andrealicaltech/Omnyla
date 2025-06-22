#!/bin/bash
while true; do
  echo "Starting agent..."
  python3 oncology-agent/main_agent.py
  echo "Agent crashed with exit code $?. Respawning in 1 second..." >&2
  sleep 1
done 