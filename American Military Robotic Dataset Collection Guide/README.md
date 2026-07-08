# Data Directory

This directory contains the datasets used for the Autonomous Military Vehicle Recognition and Tactical AI System project.

## Directory Structure

```
data/
├── raw/                    # Raw, unprocessed datasets
│   ├── indian-vehicle-dataset/
│   └── military-assets-dataset/
├── processed/              # Processed and augmented datasets
└── annotations/            # Additional annotations or metadata
```

## Datasets

### 1. Indian Vehicle Dataset

**Location:** `data/raw/indian-vehicle-dataset/`

**Source:** [Kaggle - Indian Vehicle Dataset](https://www.kaggle.com/datasets/dataclusterlabs/indian-vehicle-dataset)

**Description:** This dataset contains over 50,000 high-definition vehicle images captured across 1000+ urban and rural locations in India. Each image is manually reviewed and verified by computer vision professionals.

**Statistics:**
- Total Images: 50,000+
- Annotated Images: 15,000
- Total Bounding Boxes: 53,000
- Resolution: 100% HD (1920x1080 and above)
- Usability Score: 8.75/10

**Classes (17 total):**
1. auto
2. bus
3. truck
4. tractor
5. car
6. bike
7. bicycle
8. van
9. pickup
10. ambulance
11. truck_tanker
12. human-powered vehicle
13. bulldozer
14. crane
15. concrete_mixture
16. roller
17. excavator

**Annotation Distribution:**
- Two-wheelers (bike/bicycle): 25%
- Six+ wheelers (truck/concrete_mixture/truck_tanker/bus): 21%
- Four-wheelers (car/van): 16%
- Three-wheelers (auto): 12%
- Commercial Vehicles (pickup/ambulance): 10%
- Other Vehicles (human_powered/crane/roller/excavator/bulldozer): 10%
- Tractor: 6%

**Available Formats:**
- COCO
- YOLO
- PASCAL-VOC
- TF-Record

### 2. Military Assets Dataset

**Location:** `data/raw/military-assets-dataset/`

**Source:** [Kaggle - Military Assets Dataset (12 Classes - YOLO8 Format)](https://www.kaggle.com/datasets/rawsi18/military-assets-dataset-12-classes-yolo8-format)

**Description:** This dataset is curated for object detection and classification in military-related environments. It includes labeled images of military vehicles, personnel, and equipment.

**Statistics:**
- Total Images: 26,315
- Train Images: 21,978
- Validation Images: 2,941
- Test Images: 1,396
- Usability Score: 8.75/10
- Format: YOLO8

**Classes (12 total):**
1. camouflage_soldier - Soldiers in camouflaged gear
2. weapon - Handheld firearms and weaponry
3. military_tank - Armored combat vehicles
4. military_truck - Troop or supply transport trucks
5. military_vehicle - General military vehicles
6. civilian - Non-military individuals
7. soldier - Uniformed military personnel
8. civilian_vehicle - Civilian cars and trucks
9. military_artillery - Heavy-armament systems
10. trench - Ground combat defensive earthworks
11. military_aircraft - Combat or transport aircraft
12. military_warship - Naval vessels

**Use Cases:**
- Military reconnaissance
- Automated threat detection
- Real-time situational analysis
- Autonomous military vehicle recognition

## Data Usage

To download the datasets, run the following command from the project root:

```bash
chmod +x scripts/download_datasets.sh
./scripts/download_datasets.sh
```

**Note:** You must have your Kaggle API credentials (`kaggle.json`) in the project root directory before running the download script.

## Data Licensing

- **Indian Vehicle Dataset:** Data files © Original Authors
- **Military Assets Dataset:** Attribution 4.0 International (CC BY 4.0)

Please refer to the original dataset pages for complete licensing information and terms of use.

