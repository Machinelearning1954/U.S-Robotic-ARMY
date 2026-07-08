#!/bin/bash

# This script downloads the required datasets for the Autonomous Military Vehicle Recognition project.

# Ensure you have your kaggle.json file in the root of the project directory.
if [ ! -f "kaggle.json" ]; then
    echo "Error: kaggle.json not found. Please place your Kaggle API credentials in the root of the project directory."
    exit 1
fi

# Set up Kaggle API credentials
export KAGGLE_CONFIG_DIR=$(pwd)

# Download the Indian Vehicle Dataset

echo "Downloading Indian Vehicle Dataset..."
kaggle datasets download -d dataclusterlabs/indian-vehicle-dataset -p data/raw/indian-vehicle-dataset --unzip

# Download the Military Assets Dataset

echo "Downloading Military Assets Dataset..."
kaggle datasets download -d rawsi18/military-assets-dataset-12-classes-yolo8-format -p data/raw/military-assets-dataset --unzip

echo "Dataset download complete."

