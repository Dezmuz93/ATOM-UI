
import { NextResponse } from 'next/server';

let usageLog: any[] = [];
// const tools = ['get_temperature', 'search_web', 'recall_memory', 'toggle_light'];
const tools = ['search_web', 'recall_memory', 'System Control'];
const tags: Record<string, string> = {
    'search_web': 'Web Search',
    'recall_memory': 'Memory',
    'System Control': 'System Control'
};

// Function to add a new random log entry
const addRandomLog = () => {
    if (Math.random() > 0.6) { // Only add a log entry 40% of the time
        const tool = tools[Math.floor(Math.random() * tools.length)];
        const newLog = {
            tool: tool,
            metadata: {
                success: Math.random() > 0.2,
                tags: tags[tool] || 'General'
            },
            timestamp: new Date().toISOString()
        };
        usageLog.unshift(newLog); // Add to the beginning of the array
        if (usageLog.length > 20) {
            usageLog.pop(); // Keep the log from growing indefinitely
        }
    }
};

// Add a new log entry every few seconds
setInterval(addRandomLog, 4000);


export async function GET(request: Request) {
  try {
    return NextResponse.json({ usage: usageLog });
  } catch (error) {
    console.error('Error in tool usage mock:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
