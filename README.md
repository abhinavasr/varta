# Varta - Social Media Platform with Token Economy

Varta is a social media platform with an integrated token economy system. Users can create posts, like content, and earn tokens through engagement.

## Python Version

This branch contains the Python implementation of Varta, converted from the original Node.js/React version. The application uses Flask for both backend and frontend.

## Features

- User authentication (register, login, logout)
- User profiles with customizable information
- Post creation and interaction (likes)
- Token economy system (earn tokens through engagement)
- Responsive, mobile-first design
- Beautiful UI with animations and modern styling

## Technology Stack

- **Backend**: Flask, SQLAlchemy, PostgreSQL
- **Frontend**: Flask templates, JavaScript, CSS
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Docker, Google App Engine

## Local Development Setup

### Prerequisites

- Python 3.10+
- PostgreSQL
- pip

### Setup Instructions

1. Clone the repository and switch to the Python branch:
   ```bash
   git clone https://github.com/abhinavasr/varta.git
   cd varta
   git checkout python
   ```

2. Set up a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ../frontend
   pip install -r requirements.txt
   ```

4. Set up PostgreSQL database:
   ```bash
   # Create a database named varta_local
   createdb varta_local
   
   # Or using psql
   psql -U postgres
   CREATE DATABASE varta_local;
   \q
   ```

5. Initialize the database:
   ```bash
   cd backend
   export FLASK_APP=run.py
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

6. Start the backend server:
   ```bash
   cd backend
   export FLASK_APP=run.py
   export FLASK_DEBUG=True
   export DATABASE_URL=postgresql://postgres:postgres@localhost/varta_local
   export JWT_SECRET_KEY=dev_jwt_secret_key_for_local_testing
   export SECRET_KEY=dev_secret_key_for_local_testing
   export CORS_ALLOW_ORIGIN=http://localhost:5000
   python run.py
   ```

7. In a separate terminal, start the frontend server:
   ```bash
   cd frontend
   export FLASK_APP=app
   export FLASK_DEBUG=True
   export BACKEND_URL=http://localhost:8080/api
   flask run
   ```

8. Access the application at http://localhost:5000

## Docker Deployment

### Prerequisites

- Docker
- Docker Compose

### Deployment Steps

1. Clone the repository and switch to the Python branch:
   ```bash
   git clone https://github.com/abhinavasr/varta.git
   cd varta
   git checkout python
   ```

2. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

3. Access the application at http://localhost:5000

### Docker Configuration

The application is configured with three services:
- **db**: PostgreSQL database
- **backend**: Flask API server
- **frontend**: Flask web server

The `docker-compose.yml` file contains all necessary configuration for these services, including:
- Environment variables
- Port mappings
- Volume mounts
- Service dependencies

## Google App Engine Deployment

### Prerequisites

- Google Cloud SDK
- Google Cloud account with App Engine enabled
- Project ID: varta-455515 (or your own project)

### Deployment Steps

1. Clone the repository and switch to the Python branch:
   ```bash
   git clone https://github.com/abhinavasr/varta.git
   cd varta
   git checkout python
   ```

2. Authenticate with Google Cloud:
   ```bash
   gcloud auth login
   gcloud config set project varta-455515  # Or your project ID
   ```

3. Deploy the backend service:
   ```bash
   cd backend
   gcloud app deploy app.yaml
   ```

4. Deploy the frontend service:
   ```bash
   cd ../frontend
   gcloud app deploy app.yaml
   ```

5. Access the application at https://frontend-dot-varta-455515.uc.r.appspot.com

## Project Structure

```
varta_python/
├── backend/                # Flask backend API
│   ├── app/                # Application package
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Business logic
│   │   ├── services/       # Service layer
│   │   └── utils/          # Utility functions
│   ├── migrations/         # Database migrations
│   ├── app.yaml            # App Engine configuration
│   ├── Dockerfile          # Docker configuration
│   ├── requirements.txt    # Python dependencies
│   └── run.py              # Application entry point
│
├── frontend/               # Flask frontend
│   ├── app/                # Application package
│   │   ├── static/         # Static assets (CSS, JS, images)
│   │   │   ├── css/        # CSS stylesheets
│   │   │   ├── js/         # JavaScript files
│   │   │   └── img/        # Images
│   │   └── templates/      # HTML templates
│   ├── app.yaml            # App Engine configuration
│   ├── Dockerfile          # Docker configuration
│   └── requirements.txt    # Python dependencies
│
├── docker-compose.yml      # Docker Compose configuration
└── README.md               # Project documentation
```

## Token Economy System

The token economy system works as follows:

1. New users receive an initial balance of tokens upon registration
2. Users spend 0.1 tokens when liking a post
3. Content creators earn 0.1 tokens when their posts are liked
4. Token transactions are recorded and can be viewed in the user profile

## Future Ethereum Integration

The current implementation uses a database to track token balances and transactions. Future versions will integrate with Ethereum for a true blockchain-based token economy.

Integration points for Ethereum implementation:
- Token balance model (`token_balance.py`)
- Token transaction model (`token_transaction.py`)
- Token service layer for handling token transfers

## License

This project is licensed under the MIT License - see the LICENSE file for details.
