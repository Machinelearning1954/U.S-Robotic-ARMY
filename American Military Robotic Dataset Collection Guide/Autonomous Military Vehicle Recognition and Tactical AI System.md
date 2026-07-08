# Autonomous Military Vehicle Recognition and Tactical AI System

This repository contains the work for the **Machine Learning Engineering Bootcamp Capstone Project**, focusing on the development of an advanced computer vision system for real-time identification, classification, and tactical assessment of military and civilian vehicles.

## Project Overview

Modern warfare increasingly relies on autonomous systems and AI-powered decision-making. This project aims to build a system capable of processing high-resolution imagery to classify multiple vehicle types simultaneously and provide strategic intelligence for autonomous military operations. The AI model will be designed to operate in diverse environmental conditions and provide accurate threat assessment capabilities.

### Step 2: Data Collection

This step focuses on collecting the necessary data for the project. The criteria for this step include:

*   **Data and code are uploaded to Github.**
*   **For large datasets over 100MB, the student has used the Git Large File Extension, S3, or another appropriate way to integrate the data.**
*   **The submission shows that the student understands how to collect relevant data.**
*   **The submission includes datasets that were well-chosen and relevant to the problem.**
*   **The datasets chosen meet the minimum size requirements (i.e. at least 15K samples).**
*   **Well-documented GitHub repository with code and data or pointers to the data.**

## Datasets

Two primary datasets have been selected for this project to ensure a comprehensive and robust training environment for the model.

### 1. Indian Vehicle Dataset

*   **Source:** [Kaggle](https://www.kaggle.com/datasets/dataclusterlabs/indian-vehicle-dataset)
*   **Description:** An extremely challenging set of over 50,000+ original vehicle images captured and crowdsourced from over 1000+ urban and rural areas in India. It contains 17 classes of vehicles with over 53,000 bounding box annotations.
*   **Relevance:** This dataset provides a wide variety of civilian vehicles in diverse environments, which is crucial for training the model to distinguish between military and non-military assets.

### 2. Military Assets Dataset

*   **Source:** [Kaggle](https://www.kaggle.com/datasets/rawsi18/military-assets-dataset-12-classes-yolo8-format)
*   **Description:** This dataset is curated for object detection and classification in military-related environments. It includes a total of 26,315 labeled images, distributed across 12 classes of military and civilian objects.
*   **Relevance:** This dataset provides the necessary military-specific vehicle images and other relevant objects for training a robust tactical AI system.

## Repository Structure

```
.gitignore
README.md
data/
  annotations/
  processed/
  raw/
docs/
  data_collection_report.md
models/
notebooks/
  1-data-collection.ipynb
results/
scripts/
  download_datasets.sh
```

## Setup and Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd military-vehicle-recognition-capstone
    ```

2.  **Set up Kaggle API credentials:**

    To download the datasets, you need to have your Kaggle API credentials set up. 

    *   Go to your Kaggle account page, and click on "Create New API Token". This will download a `kaggle.json` file.
    *   Place the `kaggle.json` file in the root of this project directory.

## Data Download

To download the datasets, run the following script from the root of the project directory:

```bash
chmod +x scripts/download_datasets.sh
./scripts/download_datasets.sh
```

This script will download the datasets from Kaggle and place them in the `data/raw` directory.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

