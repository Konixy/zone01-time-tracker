#!/bin/bash

# Zone01 Time Tracker Extension Packaging Script
# This script packages the Chrome extension into a zip file for distribution

echo "📦 Packaging Zone01 Time Tracker Extension..."

# Remove existing zip file if it exists
if [ -f "zone01-time-tracker.zip" ]; then
    echo "🗑️  Removing existing zip file..."
    rm zone01-time-tracker.zip
fi

# Create new zip file with all necessary files
echo "🔄 Creating new zip file..."
zip -r zone01-time-tracker.zip manifest.json content.js README.md INSTALLATION_GUIDE.md

# Check if zip was created successfully
if [ $? -eq 0 ]; then
    echo "✅ Successfully created zone01-time-tracker.zip"
    echo "📊 Package contents:"
    unzip -l zone01-time-tracker.zip
    echo ""
    echo "🚀 Ready to send to friends!"
    echo "📍 File location: $(pwd)/zone01-time-tracker.zip"
else
    echo "❌ Error creating zip file"
    exit 1
fi 