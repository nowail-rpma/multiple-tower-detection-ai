# Tower Detection AI - YOLOv11 Web Application

A modern web application for tower detection using YOLOv11 model. Upload images and get real-time tower detection results with confidence scores and bounding box visualization.

## Features

- 🖼️ **Image Upload**: Drag & drop or click to upload tower images
- 🤖 **AI Detection**: Powered by YOLOv11 model for accurate tower detection
- 📊 **Visual Results**: Bounding box overlay with confidence scores
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Real-time Processing**: Fast inference with loading indicators
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Add Your Trained Model

1. Place your trained YOLOv11 model file in the project root
2. Rename it to `tower_model.pt` or update the `MODEL_PATH` in `app.py`

### 3. Run the Application

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
      "class_name": "tower"
    }
  ],
  "confidence": 0.85,
  "class_name": "tower",
  "bbox": [100, 50, 200, 300],
  "total_detections": 1
}
```

### GET /api/health

Check server health and model status.

## Usage

1. Open your browser and go to `http://localhost:5000`
2. Upload a tower image by dragging & dropping or clicking "Choose Image"
3. Wait for the AI to process the image
4. View the detection results with bounding box overlay and confidence score

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

1. Set `debug=False` in `app.py`
2. Use a production WSGI server like Gunicorn
3. Configure proper file upload limits
4. Set up proper error logging
5. Use HTTPS for secure file uploads

## License

This project is open source and available under the MIT License.
