# Use PyTorch base image with pre-installed ML libraries
FROM pytorch/pytorch:2.0.1-cuda11.7-cudnn8-runtime

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PORT=5000
ENV MODEL_PATH=/app/best.pt

# Install system dependencies including OpenGL libraries for OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt first for better Docker layer caching
COPY requirements.txt .

# Install Python dependencies from requirements.txt
# This layer will be cached unless requirements.txt changes
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Create a non-root user
RUN useradd --create-home --shell /bin/bash app && \
    chown -R app:app /app
USER app

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Run the application with Gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:${PORT}", "--workers", "2", "--timeout", "120", "app:app"]