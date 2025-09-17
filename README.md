# Opus1 Task Management Application

A full-stack Trello-like task management application built with React frontend, Python GraphQL backend, and local DynamoDB.

## Implementation
I used bolt.new to assist in this project.  This was mostly to get me to the point of being able to iterate with speed.  Once bolt produced the first round of code, I took over and started building it.  When I was happy with the first major version, I asked bolt to create some test cases.  

I did 2 POCs before interacting with bolt.  
1. Python implementation of GraphQL - I know python, I know GraphQL.  I hadn't done Python GraphQL before
2. DynamoDB local.  I wanted to hew close to the Opus1 stack and needed to prove it out

I wanted to fail quickly without getting too deep into the weeds of why an implementation would work or not.  

## Features

### Board Management
- Display and rename board titles
- Create and delete boards
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
- Responsive design that works on all devices (note: this RWD maintains the horizontal column layout in favor of legibility over disorienting users with a vertial layout on smaller devices.)
- Real-time updates with GraphQL polling
- Smooth drag-and-drop interactions
- Error handling and loading states
- Containerized deployment with Docker

## Assumptions
1. I chose to use a local version of dynamodb in order to showcase this app in the Opus1 tech stack faithfully.  As I don't have an AWS account, I decided not to complete the optional deployed version of this.  We can discuss how this would be deployed in a real AWS production environment using IaC patterns.
2. This implementation assumes that it is acceptable to hard delete rows in the database.  We can discuss how we might implmement a soft delete functionality.
3. This implementation assumes only one user will interact with the data because it can only be spun up locally.  This was sticky and it concerns me that that is a missed requirement.  We can chat about how we could make this multi-user.

## Getting Started

### Prerequisites
- Docker and Docker Compose installed on your system

### Running the Application

1. Clone the repository and navigate to the project directory

2. Start all services using Docker Compose:
```bash
docker compose up 
```

3. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend GraphQL API: http://localhost:4000/graphql

### Architecture

- **Frontend**: React.js with Apollo GraphQL client
- **Backend**: Python FastAPI with Strawberry GraphQL
- **Database**: Local DynamoDB (amazon/dynamodb-local)
- **Deployment**: Docker Compose orchestration

### Default Data

The application comes with sample data including:
- A default board named "Opus1 Task Board"
- Three columns: "To Do", "In Progress", "Done"
- Sample tickets distributed across columns
- Once you start working with custom boards, you can't navigate back to the default board except to clear localStorage and refresh

### Testing
To run the suites of front end and back end tests:
1. Run ```docker compose up```
2. Open a new command prompt
3. For testing backend code:
- From the project root, run ```cd backend```
- Run ```docker exec opus1-backend python -m pytest -v```
4. For testing the frontend code:
- From the project root, run ```cd frontend```
- Run ```docker exec opus1-frontend npm test```
5. Watch excitedly!

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

## Next steps
Here are some perceived next steps for this application:

### Features
- Implement a single table design model for DynamoDB 
- Enable multiple users to interact with this application at once
- Implement a soft delete functionality
- Implement a My Boards functionality where a user could see all the boards that they have created in the application and toggle in between them without losing data
- Implement auth & security
- Implement sharing

### Tech Debt
- Fix deprecation warnings highlighted by backend tests
- Fix DND opacity