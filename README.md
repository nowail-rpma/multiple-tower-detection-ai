# Tower Detection AI - YOLOv11 Web Application

A modern web application for tower detection using YOLOv11 model. Upload images and get real-time tower detection results with confidence scores and bounding box visualization.

## Features

- 🖼️ **Image Upload**: Drag & drop or click to upload tower images
- 🤖 **AI Detection**: Powered by YOLOv11 model for accurate tower detection
- 📊 **Visual Results**: Bounding box overlay with confidence scores
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Real-time Processing**: Fast inference with loading indicators
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- 🏗️ **21 Detection Classes**: Comprehensive tower and equipment detection

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Add Your Trained Model

1. Place your trained YOLOv11 model file in the project root
2. Keep it as `best.pt` (default) or set `MODEL_PATH` via environment/app config

### 3. Configure via Environment (optional)

Create a `.env` file (or export env vars):

```bash
MODEL_PATH=/app/best.pt
UPLOAD_FOLDER=uploads
ALLOWED_EXTENSIONS=png,jpg,jpeg,gif,bmp,tiff
MAX_FILE_SIZE=10485760
PORT=5000
# Optional API key for /api/* endpoints (send X-API-Key or Bearer token)
# API_KEY=changeme
```

### 4. Run the Application

```bash
python app.py
```

The application will be available at `http://localhost:5000`

## Project Structure

```
TowerUi/
├── index.html          # Main web page
├── styles.css          # CSS styling
├── script.js           # Frontend JavaScript
├── app.py              # Flask backend server
├── requirements.txt    # Python dependencies
├── README.md           # This file
└── uploads/            # Temporary upload directory (auto-created)
```

## API Endpoints

### POST /api/detect

Upload an image for tower detection.

**Request:**

- `image`: Image file (multipart/form-data)

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
    },
    {
      "bbox": [x, y, width, height],
      "confidence": 0.75,
      "class_id": 10,
      "class_name": "GSM ANTENNA"
    }
  ],
  "confidence": 0.85,
  "class_name": "Mobile Tower",
  "bbox": [100, 50, 200, 300],
  "total_detections": 2
}
```

### GET /api/health

Check server health and model status.

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
- **Solar Panel** (9) - Solar power panels
- **GSM Antenna** (10) - GSM communication antennas
- **Microwave Antenna** (11) - Microwave communication antennas
- **Microwave Antenna** (14) - Alternative microwave antenna naming
- **Panel Antenna** (15) - Panel-type antennas
- **Dirty Antenna** (16) - Antennas with dirt accumulation

### Damage & Maintenance Issues

- **Discoloration** (3) - Surface discoloration
- **Surface-Damage** (4) - Visible surface damage
- **Nest** (12) - Bird or animal nests
- **Corrosion** (13) - Corrosion damage
- **Dirty Equipment** (17) - Equipment with dirt accumulation
- **Rusty Mounts and Bolts** (18) - Rusty mounting hardware
- **Rusty Bolts** (19) - Individual rusty bolts
- **Rusty Rod and Bolts** (20) - Rusty structural elements

## Usage

1. Open your browser and go to `http://localhost:5000`
2. Upload a tower image by dragging & dropping or clicking "Choose Image"
3. Wait for the AI to process the image
4. View the detection results with bounding box overlay and confidence score
5. See detailed class information for each detected object

## Customization

### Model Configuration

Update the model path in `app.py`:

```python
MODEL_PATH = 'path/to/your/trained/model.pt'
```

### UI Customization

- Modify `styles.css` for visual changes
- Update `index.html` for layout changes
- Edit `script.js` for functionality changes

## Troubleshooting

### Model Loading Issues

- Ensure your model file is in the correct format (.pt)
- Check that the model path is correct in `app.py`
- Verify all dependencies are installed

### Upload Issues

- Check file size (max 10MB)
- Ensure file format is supported (jpg, png, gif, bmp, tiff)
- Verify uploads directory has write permissions

### Performance Issues

- Consider using GPU acceleration for faster inference
- Optimize image size before upload
- Use a more powerful server for production

## Production Deployment

For production deployment:

1. Use the included Dockerfile (runs Gunicorn) and optional Nginx proxy
2. Configure env vars (`MODEL_PATH`, `API_KEY`, `PORT`, etc.)
3. Set up proper error logging and HTTPS via reverse proxy

## License

This project is open source and available under the MIT License.
