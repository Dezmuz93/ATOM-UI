
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const status = {
      llmStatus: 'Running',
      embeddingsServer: 'Online',
      chromaDb: 'Connected',
      judgeModel: Math.random() > 0.5 ? 'Processing' : 'Sleeping',
      ttsMode: 'Piper',
      stt: 'Listening',
    };
    return NextResponse.json(status);
  } catch (error) {
    console.error('Error in health mock:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
