
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const memoryItems = [
      {
        id: "mem-1",
        content: "User's favorite color is blue.",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "mem-2",
        content: "Project codename: 'Odyssey'.",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "mem-3",
        content: "Last system diagnostic was nominal.",
        timestamp: new Date().toISOString(),
      },
    ];

    return NextResponse.json({ memory: memoryItems });
  } catch (error) {
    console.error('Error in memory mock:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
