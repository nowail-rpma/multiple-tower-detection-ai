# Tower Detection App

A web application for tower detection using AI.

## Features

- 🖼️ Image upload functionality
- 🤖 AI-powered tower detection
- 📊 Visual results with bounding boxes
- 📱 Responsive web interface

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the Application

```bash
python app.py
```

The application will be available at `http://localhost:5000`

## Usage

1. Open your browser and go to `http://localhost:5000`
2. Upload a tower image
3. View the detection results

## Project Structure

```
├── index.html          # Main web page
├── styles.css          # CSS styling
├── script.js           # Frontend JavaScript
├── app.py              # Flask backend server
├── requirements.txt    # Python dependencies
└── uploads/            # Upload directory
```

## API Endpoints

- `POST /api/detect` - Upload image for detection
- `GET /api/health` - Check server status

## License

This project is open source.
