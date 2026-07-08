#!/usr/bin/env python3
"""
Data Collection Script for Autonomous Military Vehicle Recognition System

This script provides utilities for downloading, verifying, and organizing
the datasets required for the project.

Author: Manus AI
Date: 2025-10-10
"""

import os
import sys
import json
import subprocess
from pathlib import Path


class DataCollector:
    """Handles data collection and verification for the project."""
    
    def __init__(self, project_root=None):
        """
        Initialize the DataCollector.
        
        Args:
            project_root: Path to the project root directory
        """
        if project_root is None:
            self.project_root = Path(__file__).parent.parent
        else:
            self.project_root = Path(project_root)
        
        self.data_dir = self.project_root / "data" / "raw"
        self.kaggle_config = self.project_root / "kaggle.json"
    
    def check_kaggle_credentials(self):
        """Check if Kaggle API credentials are available."""
        if not self.kaggle_config.exists():
            print("Error: kaggle.json not found in project root.")
            print("Please download your Kaggle API token and place it in the project root.")
            return False
        
        print("✓ Kaggle credentials found.")
        return True
    
    def setup_kaggle_api(self):
        """Set up Kaggle API configuration."""
        os.environ['KAGGLE_CONFIG_DIR'] = str(self.project_root)
        print("✓ Kaggle API configured.")
    
    def download_dataset(self, dataset_name, output_dir):
        """
        Download a dataset from Kaggle.
        
        Args:
            dataset_name: Kaggle dataset identifier (e.g., 'username/dataset-name')
            output_dir: Directory to save the downloaded dataset
        """
        output_path = self.data_dir / output_dir
        output_path.mkdir(parents=True, exist_ok=True)
        
        print(f"\nDownloading {dataset_name}...")
        
        try:
            cmd = [
                "kaggle", "datasets", "download",
                "-d", dataset_name,
                "-p", str(output_path),
                "--unzip"
            ]
            subprocess.run(cmd, check=True)
            print(f"✓ Successfully downloaded {dataset_name}")
            return True
        except subprocess.CalledProcessError as e:
            print(f"✗ Failed to download {dataset_name}: {e}")
            return False
    
    def verify_dataset(self, dataset_path, min_files=100):
        """
        Verify that a dataset has been downloaded correctly.
        
        Args:
            dataset_path: Path to the dataset directory
            min_files: Minimum number of files expected
        
        Returns:
            bool: True if verification passes
        """
        full_path = self.data_dir / dataset_path
        
        if not full_path.exists():
            print(f"✗ Dataset not found: {dataset_path}")
            return False
        
        # Count files recursively
        file_count = sum(1 for _ in full_path.rglob('*') if _.is_file())
        
        if file_count < min_files:
            print(f"✗ Dataset verification failed: only {file_count} files found (expected at least {min_files})")
            return False
        
        print(f"✓ Dataset verified: {file_count} files found in {dataset_path}")
        return True
    
    def collect_all_datasets(self):
        """Download and verify all required datasets."""
        print("=" * 60)
        print("Data Collection for Autonomous Military Vehicle Recognition")
        print("=" * 60)
        
        # Check credentials
        if not self.check_kaggle_credentials():
            return False
        
        # Setup Kaggle API
        self.setup_kaggle_api()
        
        # Define datasets to download
        datasets = [
            {
                "name": "dataclusterlabs/indian-vehicle-dataset",
                "output_dir": "indian-vehicle-dataset",
                "min_files": 1000
            },
            {
                "name": "rawsi18/military-assets-dataset-12-classes-yolo8-format",
                "output_dir": "military-assets-dataset",
                "min_files": 1000
            }
        ]
        
        # Download each dataset
        success = True
        for dataset in datasets:
            if not self.download_dataset(dataset["name"], dataset["output_dir"]):
                success = False
        
        # Verify datasets
        print("\n" + "=" * 60)
        print("Verifying Downloaded Datasets")
        print("=" * 60)
        
        for dataset in datasets:
            if not self.verify_dataset(dataset["output_dir"], dataset["min_files"]):
                success = False
        
        if success:
            print("\n" + "=" * 60)
            print("✓ All datasets downloaded and verified successfully!")
            print("=" * 60)
        else:
            print("\n" + "=" * 60)
            print("✗ Some datasets failed to download or verify.")
            print("=" * 60)
        
        return success


def main():
    """Main entry point for the data collection script."""
    collector = DataCollector()
    success = collector.collect_all_datasets()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()

