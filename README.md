# Icon Task Management System

A comprehensive task management system built with a modern tech stack.

## Prerequisites

- Docker
- Docker Compose

## Running the Project

To run the entire application using Docker, follow these steps:

1. Navigate to the project root directory.
   ```
   cd Icon.TaskManagementSystem
   ```

2. Build and start the services:
   
   Use the provided `run.bat` or `./run.sh` scripts to start the required services.

   or 

   Run this command in the terminal:

   ```
   docker-compose up --build
   ```

3. Wait for all services to start up. The application will be accessible at:
   - Frontend: http://localhost:4000/tasks
   - API Documentation: http://localhost:5000/openapi/v1.json

## Services

- Frontend: Serves the React application on port 4000
- Backend API: .NET API with OpenAPI documentation on port 5000
- Database: PostgreSQL database for storing tasks and related data

## Stopping the Project

To stop the services, press Ctrl+C in the terminal where Docker Compose is running, or run:

```
docker-compose down
```

## Development

For development purposes, you can run individual services together using the provided run scripts:

- ./run.sh or run.bat

## Troubleshooting

If you encounter issues:
- Ensure Docker is running
- Check that ports 4000 and 5000 are available
- Clear Docker cache if needed: docker system prune
