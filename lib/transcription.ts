export async function transcribeAudio(audioBlob: Blob): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");

    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      console.error('Transcription API error:', errorData);
      throw new Error(`Transcription API error: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    if (data.error) {
        throw new Error(`Transcription failed: ${data.error}`);
    }

    return data.transcription;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    return null;
  }
} 