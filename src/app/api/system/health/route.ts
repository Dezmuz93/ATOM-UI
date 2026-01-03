
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Simulate a quick health check
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error in system health mock:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
