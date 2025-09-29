# Tower Detection AI - Docker Setup

This guide will help you run the Tower Detection AI application using Docker.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- At least 2GB of available RAM
- Your trained YOLOv11 model file (`best.pt`) - optional

## Docker Image Details

The application uses a PyTorch-based Docker image with:

- **Base Image**: `pytorch/pytorch:2.0.1-cuda11.7-cudnn8-runtime`
- **Python Dependencies**: Flask, OpenCV, Ultralytics YOLO, Pillow, NumPy
- **System Dependencies**: OpenGL libraries for OpenCV, curl for health checks
- **Security**: Non-root user execution
- **Health Monitoring**: Built-in health check endpoint

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
docker run -p 5005:5000 -v $(pwd)/uploads:/app/uploads tower-detection-ai
```

## Accessing the Application

Once the container is running, you can access the application at:

- **Main Application**: http://localhost:5005
- **Health Check**: http://localhost:5005/api/health
- **Model Info**: http://localhost:5005/api/model-info
- **Available Classes**: http://localhost:5005/api/classes

## API Endpoints

### POST /api/detect

Upload a single image for tower detection.

**Request:**

- `image`: Image file (multipart/form-data)
- Supported formats: PNG, JPG, JPEG, GIF, BMP, TIFF
- Maximum file size: 10MB

**Response:**

```json
{
  "success": true,
  "detections": [
    {
      "bbox": [x, y, width, height],
      "confidence": 0.85,
      "class_id": 0,
      "class_name": "Mobile Tower"
    }
  ],
  "total_detections": 1,
  "message": "Found 1 object(s) in the image"
}
```

### POST /api/detect-multiple

Upload multiple images for batch tower detection.

**Request:**

- `images`: Multiple image files (multipart/form-data)

**Response:**

```json
{
  "success": true,
  "results": [
    {
      "index": 0,
      "success": true,
      "filename": "image1.jpg",
      "detections": [...],
      "total_detections": 2
    }
  ],
  "summary": {
    "total_files": 2,
    "successful_files": 2,
    "failed_files": 0,
    "total_detections": 3
  }
}
```

### GET /api/health

Check server health and model status.

**Response:**

```json
{
  "status": "healthy",
  "model_loaded": true,
  "timestamp": 1640995200.0
}
```

### GET /api/classes

Get all available detection classes from the loaded model.

**Response:**

```json
{
  "success": true,
  "classes": {
    "0": "Mobile Tower",
    "1": "Small Tower",
    "10": "GSM ANTENNA"
  },
  "total_classes": 21,
  "model_loaded": true
}
```

### GET /api/model-info

Get detailed model information including class categories.

**Response:**

```json
{
  "success": true,
  "model_loaded": true,
  "model_path": "best.pt",
  "total_classes": 21,
  "classes": {...},
  "class_categories": {
    "antenna_classes": ["GSM ANTENNA", "MICROWAVE ANTENNA"],
    "tower_classes": ["Mobile Tower", "Small Tower"],
    "damage_classes": ["Corrosion", "surface-damage"]
  }
}
```

## Detection Classes

The model can detect **21 different classes** of towers, equipment, and damage indicators:

### Tower Types

- **Mobile Tower** (0) - Mobile communication towers
- **Small Tower** (1) - Smaller tower structures
- **Tower Base** (2) - Foundation/base of towers
- **tower** (5) - General tower structures
- **BTS** (6) - Base Transceiver Station

### Equipment & Components

- **Control Box** (7) - Equipment control units
- **Generator** (8) - Power generation equipment
- **solar panel** (9) - Solar power panels
- **GSM ANTENNA** (10) - GSM communication antennas
- **MICROWAVE ANTENNA** (11) - Microwave communication antennas
- **Microwave antenna** (14) - Alternative microwave antenna naming
- **Panel antenna** (15) - Panel-type antennas
- **Dirty antenna** (16) - Antennas with dirt accumulation

### Damage & Maintenance Issues

- **discoloration** (3) - Surface discoloration
- **surface-damage** (4) - Visible surface damage
- **Nest** (12) - Bird or animal nests
- **Corrosion** (13) - Corrosion damage
- **Dirty equipment** (17) - Equipment with dirt accumulation
- **Rusty mounts and bolts** (18) - Rusty mounting hardware
- **Rusty bolts** (19) - Individual rusty bolts
- **Rusty rod and bolts** (20) - Rusty structural elements

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

### Resource Limits

The Docker Compose configuration includes:

- **Memory Limit**: 2GB maximum
- **Memory Reservation**: 1GB minimum
- **Health Check**: Automatic health monitoring every 30s
- **Restart Policy**: `unless-stopped` for automatic recovery
- **Start Period**: 40s grace period for model loading

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
- Handle large file uploads (up to 10MB)
- Configure proper timeouts for image processing
- Provide health check endpoints through the proxy

### Production Features

- **Load Balancing**: nginx can handle multiple Flask instances
- **Static File Serving**: Efficient serving of static assets
- **SSL Termination**: Easy SSL certificate configuration
- **Request Timeout**: Extended timeouts for image processing (60s)
- **File Upload Limits**: Configured for 10MB maximum file size

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
lsof -i :5005
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
3. Check port availability: `lsof -i :5005`
4. Ensure model file exists: `ls -la best.pt`

For more help, refer to the main README.md file.
