
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { latitude, longitude } = await request.json();

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
    }

    // Mock weather data
    const weatherData = {
      current: {
        temperature_2m: 15.3,
        weather_code: 3, // Partly cloudy
        wind_speed_10m: 12.5,
      },
      current_units: {
        temperature_2m: '°C',
        wind_speed_10m: 'km/h',
      },
      daily: {
        temperature_2m_max: [18.1],
        temperature_2m_min: [9.5],
        sunrise: [new Date().setHours(6, 30, 0, 0)],
        sunset: [new Date().setHours(20, 15, 0, 0)],
      },
    };

    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Error in weather mock:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
