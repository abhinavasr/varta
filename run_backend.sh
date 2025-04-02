#!/bin/bash

# Set environment variables from .env.local
export $(grep -v '^#' /home/ubuntu/varta_python/backend/.env.local | xargs)

# Activate virtual environment
source /home/ubuntu/varta_python/venv/bin/activate

# Run backend server
cd /home/ubuntu/varta_python/backend
python3 run.py
