#!/bin/bash

# Set environment variables
export FLASK_APP=run.py
export FLASK_DEBUG=True
export DATABASE_URL=postgresql://postgres:postgres@localhost/varta_local
export JWT_SECRET_KEY=dev_jwt_secret_key_for_local_testing
export SECRET_KEY=dev_secret_key_for_local_testing
export CORS_ALLOW_ORIGIN=http://localhost:5000

# Activate virtual environment
source /home/ubuntu/varta_python/venv/bin/activate

# Create PostgreSQL database
echo "Creating PostgreSQL database..."
sudo -u postgres psql -c "CREATE DATABASE varta_local;" || echo "Database may already exist"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';" || echo "Password may already be set"

# Initialize database with Flask-Migrate
echo "Initializing database with Flask-Migrate..."
cd /home/ubuntu/varta_python/backend
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

echo "Local environment setup complete!"
