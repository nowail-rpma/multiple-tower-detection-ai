# Tower Detection AI - Docker Setup

This guide will help you run the Tower Detection AI application using Docker.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

### Option 1: Using the provided script (Recommended)

```bash
# Make the script executable
chmod +x docker-run.sh

# Run the application
./docker-run.sh
```

### Option 2: Using Docker Compose directly

```bash
# Build and start the application
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### Option 3: Using Docker directly

```bash
# Build the image
docker build -t tower-detection-ai .

# Run the container
docker run -p 5000:5000 -v $(pwd)/uploads:/app/uploads tower-detection-ai
```

## Accessing the Application

Once the container is running, you can access the application at:

- **Main Application**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## Configuration

### Model File

1. **Custom Model**: Place your trained YOLOv11 model as `best.pt` in the project root
2. **Default Model**: If no custom model is found, the application will use a pretrained YOLOv11 model

### Environment Variables

You can customize the application using environment variables:

```bash
# In docker-compose.yml or docker run command
environment:
  - FLASK_ENV=production
  - PYTHONUNBUFFERED=1
```

### Volume Mounts

- `./uploads:/app/uploads` - Persistent storage for uploaded images
- `./best.pt:/app/best.pt` - Your custom trained model

## Production Deployment

For production deployment, use the nginx reverse proxy:

```bash
# Start with nginx
docker-compose --profile production up -d
```

This will:

- Run the Flask application on port 5000 (internal)
- Run nginx on port 80 (external)
- Provide better performance and security

## Docker Commands

### Build the image

```bash
docker-compose build
```

### Start the application

```bash
docker-compose up
```

### Start in background

```bash
docker-compose up -d
```

### Stop the application

```bash
docker-compose down
```

### View logs

```bash
docker-compose logs -f
```

### Rebuild and restart

```bash
docker-compose up --build
```

### Clean up

```bash
# Stop and remove containers
docker-compose down

# Remove images
docker-compose down --rmi all

# Remove volumes
docker-compose down -v
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs

# Check if port is already in use
lsof -i :5000
```

### Model loading issues

```bash
# Check if model file exists in container
docker-compose exec tower-detection ls -la /app/

# Check model loading logs
docker-compose logs tower-detection | grep -i model
```

### Memory issues

```bash
# Check container resource usage
docker stats

# Increase memory limit in docker-compose.yml
deploy:
  resources:
    limits:
      memory: 4G
```

### Permission issues

```bash
# Fix uploads directory permissions
sudo chown -R $USER:$USER uploads/
```

## Development

### Rebuild after code changes

```bash
docker-compose up --build
```

### Run with debug mode

```bash
# Edit docker-compose.yml to set FLASK_ENV=development
docker-compose up
```

### Access container shell

```bash
docker-compose exec tower-detection bash
```

## File Structure

```
TowerUi/
├── Dockerfile              # Docker image definition
├── docker-compose.yml      # Docker Compose configuration
├── .dockerignore          # Files to ignore in Docker build
├── nginx.conf             # Nginx configuration for production
├── docker-run.sh          # Convenience script to run the app
├── DOCKER_README.md       # This file
├── app.py                 # Flask application
├── requirements.txt       # Python dependencies
├── best.pt               # Your trained model (optional)
└── uploads/              # Upload directory (auto-created)
```

## Support

If you encounter any issues:

1. Check the logs: `docker-compose logs`
2. Verify Docker is running: `docker --version`
3. Check port availability: `lsof -i :5000`
4. Ensure model file exists: `ls -la best.pt`

For more help, refer to the main README.md file.
