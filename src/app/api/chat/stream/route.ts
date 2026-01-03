
import { NextResponse } from 'next/server';

// A tiny, silent WAV file encoded in Base64
const silentAudio = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

function iteratorToStream(iterator: any) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

export async function POST(request: Request) {
  const { command } = await request.json();

  const mockResponseText = `This is a mock streaming response to your command: "${command}". The text is being sent word by word to simulate a real-time stream from the language model.`;
  const words = mockResponseText.split(' ');

  const encoder = new TextEncoder();

  let textBuffer = '';
  const iterator = (async function*() {
    // First, send the audio data in a JSON chunk
    const audioPayload = { audio: silentAudio };
    yield encoder.encode(JSON.stringify(audioPayload) + '\n');
    await new Promise(resolve => setTimeout(resolve, 50));

    // Then, stream the text word by word
    for (const word of words) {
        textBuffer += word + ' ';
        const textPayload = { text: textBuffer.trim() };
        yield encoder.encode(JSON.stringify(textPayload) + '\n');
        await new Promise(resolve => setTimeout(resolve, 80));
    }
  })();

  const stream = iteratorToStream(iterator);

  return new Response(stream);
}
