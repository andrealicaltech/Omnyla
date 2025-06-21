import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: 'whisper-large-v3',
    });

    return NextResponse.json({ transcription: transcription.text });
  } catch (error) {
    console.error('Error in transcription API route:', error);
    let errorMessage = 'Failed to transcribe audio';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 