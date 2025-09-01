#!/bin/bash
set -e

echo "Starting build process..."

# Build frontend
echo "Building frontend..."
cd school_store_frontend
npm ci --legacy-peer-deps
npm run build

# Prepare Flask static directory
echo "Preparing Flask static directory..."
cd ../school_store_backend
rm -rf src/static/*
mkdir -p src/static

# Copy frontend build to Flask static
echo "Copying frontend build to Flask static directory..."
cp -r ../school_store_frontend/dist/* src/static/

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Build process completed successfully!"