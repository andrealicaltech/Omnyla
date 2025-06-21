# Nila Genomics - AI-Powered Genomic Analysis Platform

A comprehensive genomic analysis platform featuring AI-powered pathology assistance, tumor board collaboration, and pharmacogenomic insights for precision medicine.

## Features

- **Patient Management**: Complete patient dashboard with case overview, medical history, and biomarkers
- **VCF Analysis**: Real-time pharmacogenomic analysis using PharmCAT integration
- **Medical Imaging**: Interactive image gallery with MRI and histopathology visualization
- **Tumor Board**: Collaborative workspace with multi-agent AI specialists
- **Report Generation**: Comprehensive PDF reports for patients and tumor board minutes
- **Clinical Trials**: Integration with ClinicalTrials.gov for personalized trial matching

## Production Deployment on Vercel

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/genomics-5y)

### Manual Deployment

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd genomics-5y
   pnpm install
   ```

2. **Build and Test Locally**
   ```bash
   pnpm build
   pnpm start
   ```

3. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

### Environment Variables

Set these in your Vercel dashboard:

```env
# Optional: PharmCAT JAR path (if using custom installation)
PHARMCAT_JAR_PATH=/path/to/pharmcat.jar

# Production optimizations
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
```

### Configuration for Vercel

The app is pre-configured for Vercel deployment with:
- `next.config.mjs` optimized for static builds
- Image optimization disabled for better compatibility
- TypeScript and ESLint errors ignored during build (development focus)

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **State Management**: Zustand
- **PDF Generation**: jsPDF
- **File Processing**: Node.js filesystem APIs
- **Deployment**: Vercel (recommended)

## Key Components

- `VCFAnalysisTab`: Handles genomic file upload and analysis
- `TumorBoardWorkspace`: Multi-agent AI collaboration interface  
- `PatientDashboard`: Complete patient information management
- `ImagesTab`: Medical imaging with interactive annotations
- `PDF Generator`: Patient reports and tumor board minutes

## Production Features

- Error boundaries for graceful error handling
- Input validation and file size limits
- Loading states and user feedback
- Responsive design for all screen sizes
- SEO optimization and metadata
- Professional bot avatars for AI specialists

## Development

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm build
```

## Support

For technical support or questions about deployment, please refer to the documentation or create an issue.

---

Built with ❤️ for precision medicine and genomic research. Design

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/idhubal000-gmailcoms-projects/v0-nila-genomics-design)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/8FgDjeFRn3S)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/idhubal000-gmailcoms-projects/v0-nila-genomics-design](https://vercel.com/idhubal000-gmailcoms-projects/v0-nila-genomics-design)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/8FgDjeFRn3S](https://v0.dev/chat/projects/8FgDjeFRn3S)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
# berkeley-hack
# berkeley-hack
