# Vapi Voice AI Integration Guide

## Overview

Your tumor board system now supports **conversational voice AI** using Vapi! Doctors can now:

1. **Ask questions verbally** and get spoken responses from AI specialists
2. **Have natural conversations** with the AI medical team
3. **Get text-to-speech responses** for regular chat messages

## How It Works

### Voice Conversation Flow
1. Doctor clicks the **microphone button** (green) to start voice conversation
2. Vapi handles speech-to-text, sends to Claude (your existing credits!)
3. Claude responds as the appropriate specialist (Genetics, Radiology, etc.)
4. Vapi converts Claude's response to natural speech
5. Doctor hears the AI specialist speaking back

### Text-to-Speech for Regular Chat
- When you type messages and get AI responses, they'll also be spoken aloud
- Uses your existing Claude setup but adds voice capabilities

## API Keys Required

### 1. Vapi API Key (NEW - Required)
- **What it does**: Handles voice infrastructure (speech recognition, text-to-speech, real-time conversation)
- **Where to get it**: [Vapi Dashboard](https://vapi.ai)
- **Cost**: Vapi has usage-based pricing for voice minutes
- **Why needed**: Vapi orchestrates the voice conversation but delegates thinking to Claude

### 2. Your Existing Anthropic API Key (Already Have)
- **What it does**: Powers Claude for the medical expertise
- **Reused**: Your existing key and credits work perfectly
- **Why this setup**: You keep using your Claude credits, Vapi just adds voice

## Environment Variables Needed

Add these to your `.env.local` file:

```bash
# Your existing keys (keep these)
NEXT_PUBLIC_ANTHROPIC_API_KEY=your_existing_anthropic_key

# New Vapi key (get from Vapi dashboard)
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key_here

# New Vapi assistant ID (get from Vapi dashboard)
NEXT_PUBLIC_VAPI_ASSISTANT_ID=dfa9d209-84b2-42a9-8a36-4687851ec607
```

## Setup Steps

### 1. Get Vapi API Key
1. Go to [vapi.ai](https://vapi.ai)
2. Sign up/login
3. Go to Dashboard → API Keys
4. Create a new API key
5. Add to your `.env.local` as `NEXT_PUBLIC_VAPI_API_KEY`

### 2. Test the Integration
1. Start your development server: `npm run dev`
2. Go to the tumor board workspace
3. You'll see a green microphone button next to the send button
4. Click it to start voice conversation

### 3. Optional: Create Custom Assistant
Instead of the inline configuration, you can create a pre-configured assistant:

1. In Vapi Dashboard → Assistants → Create New
2. Configure:
   - **Model**: Anthropic Claude 3 Sonnet
   - **API Key**: Your Anthropic key
   - **System Message**: Copy from the code or customize
   - **Voice**: ElevenLabs (built into Vapi)
   - **Transcriber**: Deepgram (built into Vapi)
3. Save and copy the Assistant ID
4. Add to `.env.local` as `NEXT_PUBLIC_VAPI_ASSISTANT_ID`

## Features

### Voice Conversation Mode
- **Green microphone button**: Start/stop voice conversation
- **Real-time transcription**: See what you're saying
- **AI specialist responses**: Hear Claude respond as appropriate doctor
- **Status indicators**: Shows when voice is active and when AI is speaking

### Enhanced Chat
- **Text-to-speech**: AI responses are spoken automatically
- **Specialist identification**: Claude identifies as appropriate specialist
- **Patient context**: AI has full patient information for relevant responses

### Visual Indicators
- **Green dot**: Voice conversation active
- **Blue dot**: AI is currently speaking
- **Button states**: Green mic (start) → Red square (stop)

## Voice Specialists Available

The AI team includes:
- **Dr. AI Genetics**: Genomic analysis, biomarkers, hereditary factors
- **Dr. AI Radiology**: Imaging interpretation, response assessment
- **Dr. AI Oncology**: Treatment recommendations, drug selection
- **Dr. AI Pathology**: Tissue analysis, histology interpretation
- **Dr. AI Immunotherapy**: Immune markers, immunotherapy options

## Sample Conversation

**Doctor**: "What treatment options do you recommend for this patient?"

**AI (spoken)**: "Dr. AI Oncology here. Given the HER2-positive status and BRCA2 mutation, I recommend dual-targeted therapy with pertuzumab plus trastuzumab, combined with carboplatin due to BRCA2 sensitivity. Consider PARP inhibitor maintenance."

## Troubleshooting

### No Voice Response
- Check `NEXT_PUBLIC_VAPI_API_KEY` is set correctly
- Verify microphone permissions in browser
- Check browser console for errors

### Poor Audio Quality
- Ensure stable internet connection
- Try refreshing the page
- Check your microphone quality

### AI Not Understanding
- Speak clearly and at normal pace
- Try rephrasing medical questions
- Ensure background noise is minimal

## Cost Considerations

### Vapi Pricing (Approximate)
- **Voice conversations**: ~$0.10-0.15 per minute
- **Text-to-speech**: ~$0.001 per character
- **Speech-to-text**: ~$0.001 per character

### Your Existing Claude Costs
- **No change**: Same API usage as before
- **Benefit**: Voice makes interactions more natural and faster

## Technical Architecture

```
Doctor's Voice → Vapi (STT) → Claude (Your Credits) → Vapi (TTS) → Doctor Hears Response
```

1. **Speech-to-Text**: Vapi (Deepgram)
2. **AI Processing**: Claude (Your Anthropic key)
3. **Text-to-Speech**: Vapi (ElevenLabs)
4. **Orchestration**: Vapi platform

This setup gives you enterprise-grade voice AI while keeping your existing Claude investment! 