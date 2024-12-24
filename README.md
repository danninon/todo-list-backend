# Todo List Backend

## Overview
This backend supports a full-featured Todo List application with authentication and real-time updates. It provides two HTTP endpoints for user authentication and a WebSocket-based API for managing todos.

The backend is dockerized, runs on an EC2 instance, and connects to a PostgreSQL database. Continuous Integration and Deployment (CI/CD) is automated using GitHub Actions.

---

## Features
1. **Authentication**:
   - **POST /auth/login**: Accepts a JSON payload containing `userId` and `password`. Returns a JWT token upon successful login.
   - **POST /auth/register**: Accepts a JSON payload containing `userId` and `password`. Registers a new user.

2. **WebSocket API**:
   - **`getTodos`**: Fetches all todos for the connected user.
   - **`addTodo`**: Accepts XML payload for a new todo and adds it to the database.
     Example:
     ```xml
     <todo>
         <text>Sample Task</text>
         <timestamp>2023-12-21T12:00:00Z</timestamp>
     </todo>
     ```
   - **`deleteTodo`**: Accepts XML payload with the `id` of the todo to delete.
     Example:
     ```xml
     <todo>
         <text>Sample Task</text>
         <timestamp>2023-12-21T12:00:00Z</timestamp>
         <id>12345</id>
     </todo>
     ```
   - **`disconnect`**: Handles user disconnection.

3. **Database Integration**:
   - Backend uses a PostgreSQL database to store todos and user information.
   - Database and server are managed using Docker Compose.

4. **Logging**:
   - Custom logger configured under `libs/logger`.
   - Logs support different levels: `info`, `warn`, `error`, etc.
   - Logs are stored in the `logs` directory.

---

## Installation and Usage

### Prerequisites
- **Node.js** (v16 or later)
- **Docker** and **Docker Compose**
- PostgreSQL

### Environment Variables
Create an `.env` file in the root directory of the project. Below is an example configuration:
```env
# Docker container network
DB_HOST=postgres

DB_PORT=5432
DB_USER=todo_user
DB_PASSWORD=todo_pass
DB_NAME=todo_db

NODE_ENV='development'

SERVER_PORT=4000
POSTGRES_PORT=5432
```

## Setup
1. **Clone the repository:**
   ```
      git clone <repository-url>
      cd <repository-directory>
   ```
2. **Install dependencies:**
   ```
   npm install
   ```
3. **Build and start Docker containers:**
   ```
   docker-compose up --build
   ```
4. The backend server will be running on http://localhost:4000.

## Deployment

### Backend Deployment
The backend is deployed on an AWS EC2 instance and supports CI/CD automation using GitHub Actions.

---

### CI/CD Workflow
1. **Push Changes**:
   - Developers push changes to the backend repository.

2. **GitHub Actions**:
   - GitHub Actions automatically build a new Docker image.
   - The image is pushed to Docker Hub.

3. **EC2 Instance**:
   - The Docker image is pulled onto the EC2 instance.
   - Containers are restarted using `docker-compose`.

---

### CI/CD Configuration
- The GitHub Actions configuration file can be found at: ```.github/workflow```.

## Logging

Logs are stored in the `logs` directory. Use the custom logger in your code as follows:

```javascript
const logger = require('./libs/logger');

logger.info('Server started successfully!');
logger.error('An error occurred while processing the request.');
```
## API Reference

### HTTP Endpoints

#### `POST /auth/login`
**Payload:**
```json
{
    "userId": "exampleUser",
    "password": "examplePassword"
}
```
***Response***
```json
{
    "token": "JWT_TOKEN"
}
```
#### `POST /auth/register`
```json
{
    "userId": "exampleUser",
    "password": "examplePassword"
}
```
***Response***
```json
{
    "message": "Registration successful"
}
```
### WebSocket Handshake HTTP Endpoint

The WebSocket handshake is the initial HTTP request/response exchange that upgrades the connection to a WebSocket protocol. In a standard `socket.io` setup, this endpoint verifies the client before allowing a connection.

#### Endpoint: `/socket.io/`
- **Method:** `GET`
- **Description:** Handles the WebSocket handshake and verifies the client's token during connection.

#### Example Request:
```http
GET /socket.io/?EIO=4&transport=polling&t=NXxBk2T HTTP/1.1
Host: localhost:4000
Connection: keep-alive
Accept: */*
```

### WebSocket Events

#### `getTodos`
- **Payload:** N/A
- **Description:** Fetch all todos for the connected user.

#### `addTodo`
- **Payload:** XML
    ```xml
    <todo>
        <text>Example text</text>
        <timestamp>2023-12-31T23:59:59.000Z</timestamp>
    </todo>
    ```
- **Description:** Add a new todo to the database.

#### `deleteTodo`
- **Payload:** XML
    ```xml
    <todo>
        <id>unique-todo-id</id>
        <text>Example text</text>
        <timestamp>2023-12-31T23:59:59.000Z</timestamp>
    </todo>
    ```
- **Description:** Delete a specific todo by ID.

#### `disconnect`
- **Payload:** N/A
- **Description:** Handle user disconnection.

