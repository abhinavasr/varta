FROM node:20-slim

WORKDIR /app

# Install SSH server and required packages
RUN apt-get update && apt-get install -y openssh-server sudo net-tools vim && \
    mkdir -p /var/run/sshd && \
    mkdir -p /root/.ssh && \
    # Set root password to 'varta' for SSH access
    echo 'root:varta' | chpasswd && \
    # Clean up
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy SSH configuration
COPY sshd_config /etc/ssh/sshd_config

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV CORS_ALLOW_ORIGIN=http://localhost:3000

# Expose the application port and SSH port
EXPOSE 8080 22

# Start SSH service and the application
CMD service ssh start && node src/server.js
