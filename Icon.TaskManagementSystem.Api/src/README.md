# Icon Task Management System API

The backend API for the Icon Task Management System, built with .NET using Minimal APIs and following the Vertical Slice Architecture pattern.

## Technology Stack

- **.NET 8+**: Modern, high-performance application framework
- **Minimal APIs**: Lightweight approach to building HTTP APIs
- **Entity Framework Core**: ORM for data access
- **SQL Server**: Primary database
- **OpenAPI/Swashbuckle**: API documentation and testing
- **Vertical Slice Architecture**: Organized by business features rather than technical layers

## Architecture Overview

The API follows a Vertical Slice Architecture pattern, organizing code by business features rather than traditional horizontal layers. This approach promotes better maintainability and separation of concerns.

### Key Folders and Their Purpose

#### Application Layer
Located in `/Application`, this layer contains:
- **Commands and Queries**: Business logic for creating, updating, deleting, and retrieving tasks
- **Validators**: Input validation logic for API requests
- **DTOs**: Data Transfer Objects for API contracts
- **Services**: Business logic and domain services
- **Common**: Shared utilities and base classes

#### Data Layer
Located in `/Data`, this layer handles:
- **Database Context**: Entity Framework DbContext implementation
- **Migrations**: Database schema evolution scripts
- **Repositories**: Data access patterns (if needed)
- **Entity Models**: Database entity definitions

#### Domain Layer
Located in `/Domain`, this layer includes:
- **Entities**: Core business objects
- **Value Objects**: Immutable objects that represent values
- **Domain Events**: Events that occur within the domain
- **Business Rules**: Validation and business logic rules

#### Helpers
Located in `/Helpers`, this contains:
- **Extension Methods**: Utility methods extending existing types
- **Custom Attributes**: Special attributes for API behavior
- **App Extensions**: Helper methods for application setup

## API Endpoints

The API provides RESTful endpoints for managing tasks, accessible at:
- Base URL: `http://localhost:5000`
- OpenAPI Specification: `http://localhost:5000/openapi/v1.json`

## Features

- **Task Management**: Full CRUD operations for tasks
- TODO: **Authentication & Authorization**: Secure access to resources
- **Validation**: Comprehensive input validation
- **Caching**: Idempotency support for safe retries
- **Error Handling**: Consistent error response format
- TODO: **Logging**: Structured logging for debugging and monitoring

## Configuration

The application uses ASP.NET Core's configuration system with multiple sources:
- `appsettings.json`: Default settings
- `appsettings.{Environment}.json`: Environment-specific settings
- Environment variables: Runtime configuration overrides

## Running the API

The API can be run in several ways:
1. Using Visual Studio or VS Code
2. Using the .NET CLI: `dotnet run`
3. Using Docker (as part of the full application stack)

## Development Guidelines

When contributing to the API:
- Follow the Vertical Slice Architecture pattern
- Place related functionality together in feature folders
- Use meaningful names for endpoints and operations
- Implement proper validation for all inputs
- Follow RESTful API design principles
- Document new endpoints with OpenAPI annotations