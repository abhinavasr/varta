#!/bin/bash

# Set environment variables
export FLASK_APP=app
export FLASK_DEBUG=True
export BACKEND_URL=http://localhost:8080/api

# Activate virtual environment
source /home/ubuntu/varta_python/venv/bin/activate

# Run frontend server
cd /home/ubuntu/varta_python/frontend
python3 -m flask run --host=0.0.0.0 --port=5000
