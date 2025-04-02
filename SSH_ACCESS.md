# SSH Access to Docker Containers

This document explains how to access the Varta application containers via SSH for debugging and management purposes.

## SSH Configuration

The Docker setup has been enhanced to support direct SSH access to both the backend and frontend containers. The SSH service is automatically started when the containers are launched.

## SSH Access Details

### Credentials

- **Username**: root
- **Password**: varta

### SSH Ports

- **Backend Container**: Port 2222
- **Frontend Container**: Port 2223

## Connecting to Containers via SSH

### Backend Container

```bash
ssh -p 2222 root@localhost
```

When prompted, enter the password: `varta`

### Frontend Container

```bash
ssh -p 2223 root@localhost
```

When prompted, enter the password: `varta`

## Using SSH Keys (Alternative Method)

For more secure access, you can use SSH keys instead of password authentication:

1. Generate an SSH key pair if you don't already have one:
   ```bash
   ssh-keygen -t rsa -b 4096
   ```

2. Copy your public key to the containers after they're running:
   ```bash
   # For backend container
   ssh-copy-id -p 2222 root@localhost
   
   # For frontend container
   ssh-copy-id -p 2223 root@localhost
   ```

3. Connect using your SSH key:
   ```bash
   # For backend container
   ssh -p 2222 root@localhost
   
   # For frontend container
   ssh -p 2223 root@localhost
   ```

## Common SSH Use Cases

### Viewing Logs

```bash
# View Node.js application logs in the backend container
tail -f /app/logs/app.log

# View Nginx access logs in the frontend container
tail -f /var/log/nginx/access.log
```

### Checking Process Status

```bash
# Check running processes
ps aux

# Check if the application is running
netstat -tulpn
```

### Editing Files

Both containers include vim for file editing:

```bash
vim /app/src/server.js  # Edit backend code
vim /etc/nginx/conf.d/default.conf  # Edit Nginx configuration
```

### Installing Additional Tools

You can install additional tools as needed:

```bash
apt-get update
apt-get install -y <package-name>
```

## Security Considerations

- The default SSH configuration allows root login with a password, which is convenient for development but not recommended for production environments.
- For production deployments, consider:
  - Using SSH keys exclusively (disable password authentication)
  - Creating a non-root user for SSH access
  - Implementing IP-based restrictions for SSH access
  - Using a more complex password

## Troubleshooting

If you cannot connect to the containers via SSH:

1. Verify the containers are running:
   ```bash
   docker-compose ps
   ```

2. Check if the SSH service is running inside the containers:
   ```bash
   docker-compose exec backend service ssh status
   docker-compose exec frontend service ssh status
   ```

3. Verify the SSH ports are correctly mapped:
   ```bash
   docker-compose port backend 22
   docker-compose port frontend 22
   ```
