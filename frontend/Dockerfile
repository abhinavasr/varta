FROM node:20-slim as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production stage with SSH
FROM nginx:stable

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

# Copy the build output to replace the default nginx contents
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx config if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose nginx port and SSH port
EXPOSE 80 22

# Start SSH service and nginx
CMD service ssh start && nginx -g 'daemon off;'
