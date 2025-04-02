# Varta Application - Docker Deployment Guide

This guide explains how to deploy the Varta application using Docker on an Ubuntu system.

## Prerequisites

- Ubuntu 20.04 or newer
- Docker Engine installed
- Docker Compose installed
- Git installed

## Installation Steps

### 1. Install Docker and Docker Compose (if not already installed)

```bash
# Update package index
sudo apt update

# Install required packages
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

# Add Docker repository
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"

# Update package index again
sudo apt update

# Install Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add your user to the docker group to run docker without sudo
sudo usermod -aG docker $USER
```

You'll need to log out and log back in for the group changes to take effect.

### 2. Clone the Repository

```bash
git clone https://github.com/abhinavasr/varta.git
cd varta
```

### 3. Start the Application

```bash
docker-compose up -d
```

This command will:
- Build the Docker images for the frontend and backend
- Start the PostgreSQL database
- Start the backend service
- Start the frontend service

### 4. Access the Application

Once all containers are running, you can access the application at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

### 5. Monitor the Containers

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f
```

### 6. Stop the Application

```bash
docker-compose down
```

To remove all data including the database volume:

```bash
docker-compose down -v
```

## Configuration

The application is configured through environment variables in the docker-compose.yml file:

### Backend Environment Variables

- `NODE_ENV`: Set to "production" for production deployment
- `PORT`: The port the backend server runs on (default: 8080)
- `JWT_SECRET`: Secret key for JWT token generation
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`: Database connection details
- `CORS_ALLOW_ORIGIN`: Frontend URL for CORS configuration

### Frontend Environment Variables

- `REACT_APP_API_URL`: URL of the backend API

## Troubleshooting

### CORS Issues

If you encounter CORS issues, ensure the `CORS_ALLOW_ORIGIN` environment variable in the backend service matches your frontend URL.

### Database Connection Issues

If the backend cannot connect to the database:
1. Check if the PostgreSQL container is running: `docker-compose ps`
2. Check PostgreSQL logs: `docker-compose logs postgres`
3. Verify the database credentials in docker-compose.yml

### Container Startup Issues

If containers fail to start:
1. Check container logs: `docker-compose logs`
2. Verify port availability: `sudo lsof -i :3000` and `sudo lsof -i :8080`

## Production Deployment Considerations

For production deployment, consider:

1. Using a reverse proxy like Nginx for SSL termination
2. Setting up proper database backups
3. Implementing container health monitoring
4. Using Docker secrets for sensitive information instead of environment variables
5. Setting up proper logging and monitoring

## Security Notes

- Change default database credentials in production
- Use a strong JWT_SECRET value
- Consider using Docker secrets for sensitive information
- Set up proper firewall rules to restrict access to the application
