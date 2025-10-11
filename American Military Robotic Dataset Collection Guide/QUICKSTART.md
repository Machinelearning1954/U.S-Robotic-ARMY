# Quick Start Guide

This guide will help you get started with the Autonomous Military Vehicle Recognition and Tactical AI System project.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Python 3.11 or higher
- Git
- pip (Python package manager)
- A Kaggle account with API access

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd military-vehicle-recognition-capstone
```

### 2. Create a Virtual Environment (Recommended)

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Kaggle API

To download the datasets, you need to set up your Kaggle API credentials:

1. Log in to your Kaggle account at [kaggle.com](https://www.kaggle.com)
2. Go to your account settings: Click on your profile picture → Account
3. Scroll down to the "API" section
4. Click "Create New API Token"
5. This will download a file named `kaggle.json`
6. Place the `kaggle.json` file in the root directory of this project

### 5. Download Datasets

You can download the datasets using either the shell script or the Python script:

**Option A: Using Shell Script (Faster)**

```bash
chmod +x scripts/download_datasets.sh
./scripts/download_datasets.sh
```

**Option B: Using Python Script (With Verification)**

```bash
python3 scripts/data_collection.py
```

The datasets will be downloaded to the `data/raw/` directory.

### 6. Verify Installation

After downloading, verify that the datasets are in place:

```bash
ls -l data/raw/
```

You should see two directories:
- `indian-vehicle-dataset/`
- `military-assets-dataset/`

## Project Structure

```
military-vehicle-recognition-capstone/
├── data/                   # Data directory
│   ├── raw/                # Raw datasets (downloaded here)
│   ├── processed/          # Processed datasets (created during preprocessing)
│   └── annotations/        # Additional annotations
├── notebooks/              # Jupyter notebooks for exploration
├── scripts/                # Automation scripts
├── docs/                   # Documentation
├── models/                 # Trained models (created during training)
└── results/                # Experiment results
```

## Next Steps

Once you have completed the setup and downloaded the datasets, you can:

1. **Explore the Data:** Open `notebooks/1-data-collection.ipynb` in Jupyter to explore the datasets
2. **Read the Documentation:** Review `DATASETS.md` for detailed information about the datasets
3. **Proceed to EDA:** Move on to exploratory data analysis in the next notebook

## Troubleshooting

### Kaggle API Authentication Error

If you encounter an authentication error, ensure that:
- The `kaggle.json` file is in the project root directory
- The file has the correct permissions (it should not be world-readable)
- Your Kaggle account is active and has accepted the dataset terms

### Download Interrupted

If a download is interrupted, you can safely re-run the download script. It will resume or restart the download.

### Disk Space

The combined datasets are approximately 4-5 GB. Ensure you have sufficient disk space before downloading.

## Support

For questions or issues, please refer to:
- **Dataset Documentation:** `DATASETS.md`
- **Data Collection Report:** `docs/data_collection_report.md`
- **Project Summary:** `PROJECT_SUMMARY.md`

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

The datasets have their own licenses:
- Indian Vehicle Dataset: © Original Authors
- Military Assets Dataset: CC BY 4.0

