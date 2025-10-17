# Docker Setup

Basic Docker setup for the application.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

```bash
docker-compose up
```

## Accessing the Application

The application will be available at http://localhost:5005

## API Endpoints

- `POST /api/detect` - Upload image for detection
- `GET /api/health` - Check server status

## Docker Commands

```bash
# Start
docker-compose up

# Stop
docker-compose down
```

## File Structure

```
├── Dockerfile
├── docker-compose.yml
├── app.py
└── uploads/
```
