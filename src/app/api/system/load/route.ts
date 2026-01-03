
import { NextResponse } from 'next/server';

let currentLoad = 0.2;
let currentTemp = 45.0;

function updateSystemMetrics() {
    // Simulate fluctuations
    const loadChange = (Math.random() - 0.5) * 0.1; // small random change
    const tempChange = (Math.random() - 0.45) * 2; // can trend slightly upwards

    currentLoad += loadChange;
    currentTemp += tempChange;

    // Clamp values to a reasonable range
    currentLoad = Math.max(0.05, Math.min(0.95, currentLoad));
    currentTemp = Math.max(30, Math.min(90, currentTemp));
}

// Update metrics every 2 seconds
setInterval(updateSystemMetrics, 2000);


export async function GET(request: Request) {
  try {
    
    const status = {
      cpuLoad: currentLoad, // Value between 0.0 and 1.0
      temperature: currentTemp, // Value in Celsius
    };

    return NextResponse.json(status);

  } catch (error) {
    console.error('Error in system load mock:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
