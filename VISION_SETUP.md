# BiomedCLIP Vision Integration Setup

This document explains how to set up and use the BiomedCLIP vision analysis feature in your tumor board application.

## 🏗️ Architecture

```
┌───────────────────┐    POST /predict    ┌─────────────────────────┐
│  Frontend (React  │ ──────────────────▶ │   Vision-API (FastAPI)  │
│  Images tab)      │ ◀──── JSON response │  ‣ BiomedCLIP model     │
└───────────────────┘                     │  ‣ DICOM / PNG adapter │
                                          │  ‣ Medical classification│
                                          └─────────────────────────┘
```

## 🚀 Quick Start

### Option 1: Local Development

1. **Install Python Dependencies**
   ```bash
   cd vision_api
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Start Vision API**
   ```bash
   python -m vision_api.server
   # API will be available at http://localhost:8000
   ```

3. **Start Frontend** (in another terminal)
   ```bash
   pnpm dev
   # Frontend available at http://localhost:3000
   ```

### Option 2: Docker (Recommended for Demo)

1. **Build and Run with Docker Compose**
   ```bash
   docker compose up --build
   ```

   This will start both services:
   - Vision API: http://localhost:8000
   - Frontend: http://localhost:3000

## 🔧 Configuration

### Environment Variables

Add to your `.env.local`:
```bash
NEXT_PUBLIC_VISION_API_URL=http://localhost:8000
NEXT_PUBLIC_ANTHROPIC_API_KEY=your-anthropic-key
GROQ_API_KEY=your-groq-key
```

## 🖼️ How to Use

1. **Navigate to Images Tab**
   - Go to the tumor board workspace
   - Click on the "Images" tab

2. **Select an Image**
   - Click on any thumbnail to select it
   - The main viewer will show the selected image

3. **Run AI Analysis**
   - Click "Analyze" for basic classification
   - Click "With Heatmap" for analysis with attention visualization
   - Results will appear in the "BiomedCLIP Analysis" section

4. **View Results**
   - AI classification label (e.g., "glioma on brain MRI")
   - Confidence percentage
   - Color-coded confidence badges (High/Medium/Low)
   - Optional heatmap overlay showing model attention

## 🧠 Supported Medical Conditions

The BiomedCLIP model can classify:

**Brain/Neurological:**
- Brain tumor, Glioma, Meningioma
- Stroke, Hemorrhage, Ischemic stroke
- Multiple sclerosis lesions
- Alzheimer disease changes

**Chest/Pulmonary:**
- Pneumonia, COVID-19 pneumonia
- Lung cancer, Pleural effusion
- Pneumothorax, Atelectasis
- Cardiomegaly, Consolidation

**Abdominal:**
- Liver cirrhosis, Kidney stones
- Appendicitis, Bowel obstruction
- Pancreatic cancer, Gallstones

## 📊 API Endpoints

### GET /health
Health check with model information

### POST /predict
Basic image classification
- **Input:** Multipart form with image file
- **Output:** `{label: string, confidence: number}`

### POST /predict-with-heatmap
Classification with attention heatmap
- **Input:** Multipart form with image file  
- **Output:** `{label: string, confidence: number, heatmap: string}`

## 🐛 Troubleshooting

### Common Issues

1. **"Analysis failed" error**
   - Check if vision API is running on port 8000
   - Verify NEXT_PUBLIC_VISION_API_URL in .env.local
   - Check browser console for detailed errors

2. **Model loading slow on first run**
   - BiomedCLIP model (~1GB) downloads on first use
   - Subsequent runs use cached model
   - Check ~/.cache/biomedclip directory

3. **CORS errors**
   - Vision API allows all origins for hackathon
   - Check if both services are running

4. **Image format not supported**
   - Supported: .dcm (DICOM), .png, .jpg, .jpeg
   - DICOM files are automatically converted to RGB

### Performance Notes

- **CPU Mode:** ~1-3 seconds per image
- **GPU Mode:** ~0.5-1 seconds per image (if CUDA available)
- **Memory Usage:** ~2GB RAM for model + inference
- **Model Size:** ~1GB download (cached locally)

## 🔬 Technical Details

- **Model:** Microsoft BiomedCLIP (ViT-B/16)
- **Training:** 15M+ medical image-text pairs
- **License:** Apache 2.0
- **Framework:** PyTorch + OpenCLIP
- **DICOM Support:** pydicom with automatic preprocessing

## 🎯 Next Steps

Potential enhancements:
- [ ] Grad-CAM heatmap generation
- [ ] Custom medical condition labels
- [ ] Batch processing multiple images
- [ ] Integration with PACS systems
- [ ] Real-time streaming analysis 