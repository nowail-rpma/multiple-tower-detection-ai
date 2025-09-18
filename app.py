from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import cv2
import numpy as np
import torch
from ultralytics import YOLO
import os
import time
from werkzeug.utils import secure_filename
import base64
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# Create upload directory
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load YOLOv11 model (you'll need to replace this with your trained model path)
# For now, using a placeholder - replace with your actual model path
MODEL_PATH = 'best.pt'  # Replace with your trained model path
model = None

def load_model():
    """Load the YOLOv11 model"""
    global model
    try:
        print(f"Attempting to load model from: {MODEL_PATH}")
        print(f"Current working directory: {os.getcwd()}")
        print(f"Model file exists: {os.path.exists(MODEL_PATH)}")
        
        if os.path.exists(MODEL_PATH):
            model = YOLO(MODEL_PATH)
            print(f"Model loaded successfully from {MODEL_PATH}")
            print(f"Model type: {type(model)}")
            if hasattr(model, 'names'):
                print(f"Model classes: {model.names}")
        else:
            print(f"Custom model not found at {MODEL_PATH}")
            print("Downloading pretrained YOLOv11 model for demo...")
            # Download pretrained model
            model = YOLO('yolov11n.pt')
            print("Using pretrained YOLOv11 model (replace with your trained model)")
    except Exception as e:
        print(f"Error loading model: {e}")
        import traceback
        traceback.print_exc()
        print("Please add your trained model file as 'best.pt' in the project root")
        model = None

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(image_path):
    """Preprocess image for YOLO inference"""
    try:
        # Read image
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError("Could not read image")
        
        # Convert BGR to RGB
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        return image
    except Exception as e:
        raise ValueError(f"Error preprocessing image: {e}")

def run_inference(image):
    """Run YOLO inference on the image"""
    try:
        if model is None:
            # Return mock detection for demo purposes
            return [
                {
                    'bbox': [100, 100, 200, 300],
                    'confidence': 0.01,
                    'class_id': 0,
                    'class_name': 'tower'
                },
                {
                    'bbox': [80, 280, 240, 350],
                    'confidence': 0.01,
                    'class_id': 1,
                    'class_name': 'tower base'
                }
            ]
        
        # Run inference
        results = model(image)
        
        # Process results
        detections = []
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for i, box in enumerate(boxes):
                    # Get bounding box coordinates (xyxy format)
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    
                    # Convert to xywh format
                    x, y, w, h = x1, y1, x2 - x1, y2 - y1
                    
                    # Get confidence and class
                    confidence = box.conf[0].cpu().numpy()
                    class_id = int(box.cls[0].cpu().numpy())
                    class_name = model.names[class_id] if hasattr(model, 'names') else 'object'
                    
                    detections.append({
                        'bbox': [float(x), float(y), float(w), float(h)],
                        'confidence': float(confidence),
                        'class_id': class_id,
                        'class_name': class_name
                    })
        
        return detections
    except Exception as e:
        raise ValueError(f"Error during inference: {e}")

@app.route('/')
def index():
    """Serve the main page"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    """Serve static files"""
    return send_from_directory('.', filename)

@app.route('/api/detect', methods=['POST'])
def detect_tower():
    """API endpoint for tower detection - supports single image"""
    try:
        # Check if image file is present
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file type
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload an image.'}), 400
        
        # Check file size
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({'error': 'File too large. Maximum size is 10MB.'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        timestamp = str(int(time.time()))
        filename = f"{timestamp}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        try:
            # Preprocess image
            image = preprocess_image(file_path)
            
            # Run inference
            detections = run_inference(image)
            
            # Process results - always return success to display image
            if detections:
                # Get the detection with highest confidence
                best_detection = max(detections, key=lambda x: x['confidence'])
                
                response = {
                    'success': True,
                    'detections': detections,
                    'confidence': best_detection['confidence'],
                    'class_name': best_detection['class_name'],
                    'bbox': best_detection['bbox'],
                    'total_detections': len(detections)
                }
            else:
                # No detections found, but still return success to display image
                response = {
                    'success': True,
                    'detections': [],
                    'confidence': 0.0,
                    'class_name': 'No tower detected',
                    'bbox': None,
                    'total_detections': 0,
                    'message': 'Image uploaded successfully, but no tower detected'
                }
            
            return jsonify(response)
            
        finally:
            # Clean up uploaded file
            if os.path.exists(file_path):
                os.remove(file_path)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/detect-multiple', methods=['POST'])
def detect_towers_multiple():
    """API endpoint for multiple tower detection"""
    try:
        # Check if image files are present
        if 'images' not in request.files:
            return jsonify({'error': 'No image files provided'}), 400
        
        files = request.files.getlist('images')
        
        if not files or all(file.filename == '' for file in files):
            return jsonify({'error': 'No files selected'}), 400
        
        results = []
        processed_files = []
        
        for i, file in enumerate(files):
            if file.filename == '':
                continue
                
            # Check file type
            if not allowed_file(file.filename):
                results.append({
                    'index': i,
                    'success': False,
                    'error': 'Invalid file type',
                    'filename': file.filename
                })
                continue
            
            # Check file size
            file.seek(0, 2)  # Seek to end
            file_size = file.tell()
            file.seek(0)  # Reset to beginning
            
            if file_size > MAX_FILE_SIZE:
                results.append({
                    'index': i,
                    'success': False,
                    'error': 'File too large',
                    'filename': file.filename
                })
                continue
            
            # Save uploaded file
            filename = secure_filename(file.filename)
            timestamp = str(int(time.time()))
            filename = f"{timestamp}_{i}_{filename}"
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            processed_files.append(file_path)
            
            try:
                # Preprocess image
                image = preprocess_image(file_path)
                
                # Run inference
                detections = run_inference(image)
                
                # Process results
                if detections:
                    # Get the detection with highest confidence
                    best_detection = max(detections, key=lambda x: x['confidence'])
                    
                    result = {
                        'index': i,
                        'success': True,
                        'filename': file.filename,
                        'detections': detections,
                        'confidence': best_detection['confidence'],
                        'class_name': best_detection['class_name'],
                        'bbox': best_detection['bbox'],
                        'total_detections': len(detections)
                    }
                else:
                    result = {
                        'index': i,
                        'success': True,
                        'filename': file.filename,
                        'detections': [],
                        'confidence': 0.0,
                        'class_name': 'No tower detected',
                        'bbox': None,
                        'total_detections': 0,
                        'message': 'Image processed successfully, but no tower detected'
                    }
                
                results.append(result)
                
            except Exception as e:
                results.append({
                    'index': i,
                    'success': False,
                    'error': str(e),
                    'filename': file.filename
                })
            finally:
                # Clean up uploaded file
                if os.path.exists(file_path):
                    os.remove(file_path)
        
        # Calculate summary statistics
        successful_results = [r for r in results if r.get('success', False)]
        total_detections = sum(r.get('total_detections', 0) for r in successful_results)
        
        response = {
            'success': True,
            'results': results,
            'summary': {
                'total_files': len(files),
                'successful_files': len(successful_results),
                'failed_files': len(results) - len(successful_results),
                'total_detections': total_detections
            }
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'timestamp': time.time()
    })

@app.errorhandler(413)
def too_large(e):
    """Handle file too large error"""
    return jsonify({'error': 'File too large. Maximum size is 10MB.'}), 413

if __name__ == '__main__':
    print("Loading YOLOv11 model...")
    load_model()
    print("Starting Flask server...")
    # Use 0.0.0.0 for Docker compatibility
    app.run(debug=False, host='0.0.0.0', port=5001)
