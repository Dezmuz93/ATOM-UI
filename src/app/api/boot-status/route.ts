
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { module } = await request.json();

    if (!module) {
      return NextResponse.json({ error: 'Module name is required' }, { status: 400 });
    }

    // Simulate a check, always return ok for the mock
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    return NextResponse.json({ status: 'ok', module });
  } catch (error) {
    console.error('Error in boot-status mock:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
