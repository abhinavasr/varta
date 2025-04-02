FROM node:20-slim

WORKDIR /app

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

# Expose the port
EXPOSE 8080

# Start the application
CMD ["node", "src/server.js"]
