// Rich Sample Projects and Demonstration Files for ASTRA Studio

export const ASTRA_SAMPLE_PROJECTS = [
  {
    id: 'hospital-api',
    name: 'Hospital Management',
    slug: 'hospital-api',
    path: '/projects/hospital',
    description: 'AI-powered hospital management system with patient, radiology, and pharmacy modules.',
    techStack: ['Python', 'FastAPI', 'React', 'PostgreSQL', 'Docker', 'Tailwind'],
    status: 'active',
    stats: { files: 48, commits: 128, lastUpdated: '2 hours ago' },
    files: [
      {
        path: 'app/main.py',
        name: 'main.py',
        language: 'python',
        content: `from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(title="Hospital Management API", version="1.0.0")

class Patient(BaseModel):
    id: int
    name: str
    age: int
    gender: str
    admission_status: str = "admitted"

# In-memory medical records registry
PATIENTS_DB = {
    1: {"id": 1, "name": "John Doe", "age": 35, "gender": "Male", "admission_status": "admitted"},
    2: {"id": 2, "name": "Jane Smith", "age": 28, "gender": "Female", "admission_status": "discharged"}
}

@app.get("/patients/{patient_id}")
async def get_patient(patient_id: int):
    """Fetch patient clinical record by ID."""
    if patient_id not in PATIENTS_DB:
        raise HTTPException(status_code=404, detail="Patient record not found")
    return PATIENTS_DB[patient_id]

@app.post("/patients", status_code=status.HTTP_201_CREATED)
async def create_patient(patient: Patient):
    """Register a new patient admission record."""
    PATIENTS_DB[patient.id] = patient.dict()
    return {"message": "Patient registered successfully", "patient": PATIENTS_DB[patient.id]}
`
      },
      {
        path: 'app/models.py',
        name: 'models.py',
        language: 'python',
        content: `from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class VitalSigns(BaseModel):
    blood_pressure_systolic: int = Field(..., ge=60, le=240)
    blood_pressure_diastolic: int = Field(..., ge=40, le=140)
    heart_rate_bpm: int = Field(..., ge=30, le=220)
    temperature_celsius: float = Field(..., ge=34.0, le=42.0)
    recorded_at: datetime = Field(default_factory=datetime.utcnow)
`
      },
      {
        path: 'app/views.py',
        name: 'views.py',
        language: 'python',
        content: `from fastapi import APIRouter

router = APIRouter(prefix="/v1/clinical")

@router.get("/vitals/summary")
async def vitals_summary():
    return {"status": "normal", "active_monitoring_patients": 42}
`
      },
      {
        path: 'requirements.txt',
        name: 'requirements.txt',
        language: 'plaintext',
        content: `fastapi==0.110.0\nuvicorn==0.28.0\npydantic==2.6.4\npytest==8.1.1\n`
      },
      {
        path: 'Dockerfile',
        name: 'Dockerfile',
        language: 'dockerfile',
        content: `FROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install --no-cache-dir -r requirements.txt\nCOPY . .\nEXPOSE 8000\nCMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]\n`
      }
    ]
  },
  {
    id: 'radiology-ai',
    name: 'Radiology AI',
    slug: 'radiology-ai',
    path: '/projects/radiology',
    description: 'Deep neural network analysis service for DICOM scans and anomalies.',
    techStack: ['Python', 'PyTorch', 'FastAPI', 'CUDA'],
    status: 'idle',
    stats: { files: 32, commits: 86, lastUpdated: '1 day ago' },
    files: [
      {
        path: 'inference.py',
        name: 'inference.py',
        language: 'python',
        content: `import torch\n\ndef run_inference(dicom_tensor):\n    """Evaluate DICOM slice through convolutional spine."""\n    return {"anomaly_detected": False, "confidence": 0.994}\n`
      }
    ]
  },
  {
    id: 'pharmacy-system',
    name: 'Pharmacy System',
    slug: 'pharmacy-system',
    path: '/projects/pharmacy',
    description: 'Automated prescription verification and inventory control ledger.',
    techStack: ['TypeScript', 'Node.js', 'PostgreSQL', 'Prisma'],
    status: 'idle',
    stats: { files: 24, commits: 54, lastUpdated: '3 days ago' },
    files: [
      {
        path: 'inventory.ts',
        name: 'inventory.ts',
        language: 'typescript',
        content: `export interface Medication {\n  ndcCode: string;\n  name: string;\n  unitsInStock: number;\n}\n`
      }
    ]
  }
];
