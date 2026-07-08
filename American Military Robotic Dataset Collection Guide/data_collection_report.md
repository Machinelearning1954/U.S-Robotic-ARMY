# Data Collection Report

**Project:** Autonomous Military Vehicle Recognition and Tactical AI System

**Date:** 2025-10-10

## 1. Introduction

This document outlines the data collection process for the Autonomous Military Vehicle Recognition and Tactical AI System capstone project. The objective of this phase is to identify and collect relevant datasets that meet the project's requirements for training a robust computer vision model capable of distinguishing between military and civilian vehicles.

## 2. Data Requirements

The project requires a large and diverse dataset of vehicle images with the following characteristics:

*   **Minimum Sample Size:** 15,000 images
*   **High Resolution:** HD images (1920x1080 or higher)
*   **Rich Annotations:** Bounding box annotations for object detection
*   **Diversity:** A wide variety of vehicle types, viewpoints, and environmental conditions
*   **Relevance:** A mix of civilian and military vehicles to train a discriminative model

## 3. Dataset Selection

Based on the project requirements, two primary datasets were selected from Kaggle, a well-known platform for data science and machine learning datasets.

### 3.1. Indian Vehicle Dataset

*   **Source:** [https://www.kaggle.com/datasets/dataclusterlabs/indian-vehicle-dataset](https://www.kaggle.com/datasets/dataclusterlabs/indian-vehicle-dataset)
*   **Rationale:** This dataset was chosen for its extensive collection of civilian vehicle images from diverse, real-world scenarios. With over 50,000 high-resolution images and 53,000 annotations, it provides a strong foundation for training the model to recognize a wide range of non-military vehicles. The dataset's diversity in terms of vehicle types, lighting conditions, and viewpoints is crucial for building a robust and generalizable model.

### 3.2. Military Assets Dataset

*   **Source:** [https://www.kaggle.com/datasets/rawsi18/military-assets-dataset-12-classes-yolo8-format](https://www.kaggle.com/datasets/rawsi18/military-assets-dataset-12-classes-yolo8-format)
*   **Rationale:** To enable the model to identify military vehicles, a specialized dataset containing military assets was required. The Military Assets Dataset was selected for its comprehensive collection of 26,315 labeled images across 12 classes, including military tanks, trucks, aircraft, and warships. The inclusion of both military and civilian vehicle classes in this dataset makes it particularly valuable for training a model that can accurately differentiate between threat and non-threat assets.

## 4. Data Collection Process

The data collection process is automated through a shell script that utilizes the Kaggle API. This ensures a reproducible and efficient workflow.

1.  **Kaggle API Setup:** The user is required to provide their Kaggle API credentials (`kaggle.json`) to authenticate with the Kaggle platform.

2.  **Download Script:** A shell script, `scripts/download_datasets.sh`, is provided to automate the download and extraction of the datasets. The script performs the following steps:
    *   Sets the Kaggle configuration directory to the project's root.
    *   Downloads the Indian Vehicle Dataset and unzips it into the `data/raw/indian-vehicle-dataset` directory.
    *   Downloads the Military Assets Dataset and unzips it into the `data/raw/military-assets-dataset` directory.

## 5. Data Storage and Versioning

*   **Large File Storage:** Given the large size of the datasets (over 100MB), Git Large File Storage (LFS) is recommended for versioning the data files. The `.gitignore` file is configured to exclude the raw data directories from standard Git tracking.
*   **Directory Structure:** The downloaded datasets are stored in the `data/raw` directory, with separate subdirectories for each dataset. This organized structure facilitates data management and preprocessing.

## 6. Conclusion

The selected datasets meet and exceed the project's data requirements, providing a solid foundation for training a high-performance Autonomous Military Vehicle Recognition and Tactical AI System. The automated data collection process ensures reproducibility and simplifies the setup for future development and experimentation.

