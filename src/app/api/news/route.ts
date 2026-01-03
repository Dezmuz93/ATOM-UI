
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const articles = [
      {
        id: '1',
        source: 'Tech Insights',
        headline: 'Breakthrough in Quantum Computing Announced',
        summary: 'Researchers have achieved a new milestone in quantum supremacy, potentially accelerating drug discovery and materials science.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        source: 'Global Weather Watch',
        headline: 'Unusual Solar Flare Activity Detected',
        summary: 'An unexpected series of solar flares may cause temporary disruptions to satellite communications over the next 48 hours.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        source: 'Financial Times',
        headline: 'AI-driven Market Predictions Show Volatility',
        summary: 'Algorithmic trading models are forecasting a period of increased market volatility, citing geopolitical and environmental factors.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        source: 'Science Today',
        headline: 'New Exoplanet with Water Vapor Signature Found',
        summary: 'The James Webb Space Telescope has identified a promising exoplanet within the habitable zone of a nearby star, showing signs of water in its atmosphere.',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
    ];
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error in news mock:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
