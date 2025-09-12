# Trello-like Task Management Application

A full-stack Trello-like task management application built with React frontend, Python GraphQL backend, and local DynamoDB.

## Features

### Board Management
- Display and rename board titles
- Persistent board state with automatic reloading

### Column Management
- Create new columns with custom names
- Rename existing columns inline
- Drag-and-drop column reordering
- Delete columns (with confirmation)

### Ticket Management
- Create tickets with title and description
- Edit ticket details in modal view
- Drag-and-drop tickets between columns
- Reorder tickets within columns
- Delete tickets with confirmation

### Technical Features
- Responsive design that works on all devices
- Real-time updates with GraphQL polling
- Smooth drag-and-drop interactions
- Error handling and loading states
- Containerized deployment with Docker

## Getting Started

### Prerequisites
- Docker and Docker Compose installed on your system

### Running the Application

1. Clone the repository and navigate to the project directory

2. Start all services using Docker Compose:
```bash
docker-compose up --build
```

3. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend GraphQL API: http://localhost:4000/graphql
   - DynamoDB Admin: http://localhost:8000

### Architecture

- **Frontend**: React.js with Apollo GraphQL client
- **Backend**: Python FastAPI with Strawberry GraphQL
- **Database**: Local DynamoDB (amazon/dynamodb-local)
- **Deployment**: Docker Compose orchestration

### Default Data

The application comes with sample data including:
- A default board named "My Trello Board"
- Three columns: "To Do", "In Progress", "Done"
- Sample tickets distributed across columns

### Development

To make changes:
1. Modify files in `frontend/` or `backend/` directories
2. Changes will be reflected automatically due to volume mounts
3. Restart containers if needed: `docker-compose restart`

### Stopping the Application

```bash
docker-compose down
```

This will stop all containers while preserving your data in the DynamoDB instance.