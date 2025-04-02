import os
import json
import google.auth
from google.cloud import storage
from google.auth.transport.requests import Request
import requests
import time

# Load service account credentials
credentials_path = '/home/ubuntu/.config/gcloud/application_default_credentials.json'
with open(credentials_path, 'r') as f:
    credentials_info = json.load(f)

# Project ID
project_id = 'varta-455515'

# Function to deploy app to App Engine
def deploy_app(service_dir, service_name):
    print(f"Deploying {service_name} service...")
    
    # Create a deployment package
    os.system(f"cd {service_dir} && zip -r ../{service_name}_deploy.zip .")
    
    print(f"Deployment package created for {service_name}")
    print(f"To deploy to App Engine, run the following commands manually:")
    print(f"1. gcloud auth login")
    print(f"2. gcloud config set project {project_id}")
    print(f"3. cd {service_dir}")
    print(f"4. gcloud app deploy app.yaml")
    
    print(f"\nDeployment instructions for {service_name} prepared")
    return True

# Deploy backend first
backend_success = deploy_app('/home/ubuntu/varta_python/backend', 'backend')

# Then deploy frontend
if backend_success:
    frontend_success = deploy_app('/home/ubuntu/varta_python/frontend', 'frontend')
    
    if frontend_success:
        print("Both services deployment instructions prepared!")
        print("Backend URL: https://backend-dot-varta-455515.uc.r.appspot.com")
        print("Frontend URL: https://frontend-dot-varta-455515.uc.r.appspot.com")
    else:
        print("Frontend deployment preparation failed.")
else:
    print("Backend deployment preparation failed.")
