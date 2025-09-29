#!/usr/bin/env python3
"""
Test script to verify best.pt model loading and class information
"""

import os
import sys
from ultralytics import YOLO

def test_model():
    """Test the best.pt model"""
    model_path = 'best.pt'
    
    print("=" * 50)
    print("Testing best.pt Model")
    print("=" * 50)
    
    # Check if model file exists
    if not os.path.exists(model_path):
        print(f"❌ ERROR: Model file '{model_path}' not found!")
        print("Please ensure best.pt is in the current directory")
        return False
    
    print(f"✅ Model file found: {model_path}")
    print(f"📁 File size: {os.path.getsize(model_path) / (1024*1024):.2f} MB")
    
    try:
        # Load the model
        print("\n🔄 Loading model...")
        model = YOLO(model_path)
        print("✅ Model loaded successfully!")
        
        # Get model information
        print(f"\n📊 Model Information:")
        print(f"   Type: {type(model)}")
        
        if hasattr(model, 'names'):
            print(f"   Total Classes: {len(model.names)}")
            print(f"\n📋 Available Classes:")
            for class_id, class_name in model.names.items():
                print(f"   {class_id:2d}: {class_name}")
        else:
            print("   ⚠️  Warning: Model names not available")
        
        # Test model with dummy image
        print(f"\n🧪 Testing model inference...")
        import numpy as np
        dummy_image = np.zeros((640, 640, 3), dtype=np.uint8)
        results = model(dummy_image, verbose=False)
        print("✅ Model inference test successful!")
        
        # Test with actual parameters
        print(f"\n🎯 Testing with optimal parameters...")
        results = model(dummy_image, conf=0.20, iou=0.50, max_det=300, verbose=False)
        print("✅ Model with optimal parameters working!")
        
        print(f"\n🎉 Model is ready for use!")
        return True
        
    except Exception as e:
        print(f"❌ ERROR loading model: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_model()
    sys.exit(0 if success else 1)
