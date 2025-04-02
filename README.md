# Varta Social Media Platform

Varta is a social media platform with an integrated token economy system. Users can create posts, like and reshare content, and earn/spend tokens through platform interactions.

## Features

- User authentication (register, login, profile management)
- Post creation and viewing with media support
- Like and reshare functionality with token rewards
- Token economy system (0.1 token cost for likes, credited to original content creator)
- Mobile-first responsive design
- Left/right rating system for content

## Technology Stack

- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Sequelize ORM
- **Frontend**: React with TypeScript and Material-UI
- **Token System**: Database-based with future Ethereum integration points

## Development Setup

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env  # Configure your environment variables
npm start
```

## Deployment

### Google Cloud App Engine

The application is deployed on Google Cloud App Engine:

- Backend: [https://varta-455515.uc.r.appspot.com](https://varta-455515.uc.r.appspot.com)
- Frontend: [https://frontend-dot-varta-455515.uc.r.appspot.com](https://frontend-dot-varta-455515.uc.r.appspot.com)

### Docker Deployment

The application can also be deployed using Docker on any Ubuntu system:

#### Prerequisites

- Ubuntu 20.04 or newer
- Docker Engine
- Docker Compose

#### Quick Start

1. Clone this repository:
   ```bash
   git clone https://github.com/abhinavasr/varta.git
   cd varta
   ```

2. Start the application:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

4. Stop the application:
   ```bash
   docker-compose down
   ```

#### SSH Access to Docker Containers

The Docker setup supports direct SSH access to both the backend and frontend containers for debugging and management purposes.

##### SSH Credentials
- **Username**: root
- **Password**: varta

##### SSH Connection Commands

For Backend Container:
```bash
ssh -p 2222 root@localhost
```

For Frontend Container:
```bash
ssh -p 2223 root@localhost
```

For detailed Docker deployment instructions, see [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)

For comprehensive SSH access documentation, see [SSH_ACCESS.md](SSH_ACCESS.md)

## Ethereum Integration

The current implementation uses a database-based token system. For future Ethereum integration, see the documentation in `backend/src/docs/ethereum_integration.md`.

## Project Structure

```
varta/
├── backend/             # Express backend API
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Express middleware
│   │   ├── models/      # Sequelize models
│   │   ├── routes/      # API routes
│   │   ├── utils/       # Utility functions
│   │   └── server.js    # Server entry point
│   └── package.json
├── frontend/            # React frontend application
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React context providers
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service modules
│   │   └── App.tsx      # Main application component
│   └── package.json
└── README.md
```

## License

This project is licensed under the MIT License.
