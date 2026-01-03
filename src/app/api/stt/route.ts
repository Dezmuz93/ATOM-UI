
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { audio } = await request.json();

    if (!audio) {
      return NextResponse.json({ error: 'Audio data is required' }, { status: 400 });
    }

    // In a real app, you'd send this to a speech-to-text service.
    // For the mock, we just return a fixed string.
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({ text: "This is a mock transcription from the audio you sent." });

  } catch (error) {
    console.error('Error in STT mock:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
