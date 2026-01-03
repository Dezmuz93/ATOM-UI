
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Cloudy,
  Wind,
  Loader,
  AlertCircle,
  Thermometer,
  Sunrise,
  Sunset,
} from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { api } from '@/lib/api';

const weatherIconMap: { [key: number]: React.ElementType } = {
  0: Sun,
  1: Cloudy,
  2: Cloudy,
  3: Cloud,
  45: Cloud,
  48: Cloud,
  51: CloudRain,
  53: CloudRain,
  55: CloudRain,
  61: CloudRain,
  63: CloudRain,
  65: CloudRain,
  71: CloudSnow,
  73: CloudSnow,
  75: CloudSnow,
  80: CloudRain,
  81: CloudRain,
  82: CloudRain,
  95: CloudLightning,
  96: CloudLightning,
  99: CloudLightning,
};

const WeatherWidget = () => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api('/api/weather', {
          method: 'POST',
          body: JSON.stringify({ latitude: lat, longitude: lon }),
        });
        if (!response.ok) {
          throw new Error('Failed to fetch weather data.');
        }
        const data = await response.json();
        setWeather(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setError('Location access denied. Using fallback location.');
        // Fallback to a default location like New York
        fetchWeather(40.7128, -74.0060);
      }
    );
  }, []);

  if (loading) {
    return (
      <Card className="w-full h-full bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center gap-4">
            <Skeleton className="w-24 h-24 rounded-full" />
            <Skeleton className="h-16 w-32" />
          </div>
          <div className="flex justify-around">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !weather) {
    return (
       <Card className="w-full h-full bg-card/50 backdrop-blur-sm flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <CardTitle className="text-destructive">Weather Unavailable</CardTitle>
            <CardDescription>{error || 'Could not load weather data.'}</CardDescription>
        </Card>
    );
  }
  
  if (!weather) return null;

  const CurrentIcon = weatherIconMap[weather.current.weather_code] || Cloud;
  const today = weather.daily;

  return (
    <Card className="w-full h-full bg-card/50 backdrop-blur-sm flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-primary">
          Weather Intel
        </CardTitle>
        {error && <CardDescription className="text-yellow-500">{error}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col flex-1 justify-between">
        <div className="flex items-center justify-center text-center gap-4 md:gap-8 my-4">
          <CurrentIcon className="w-20 h-20 md:w-24 md:h-24 text-primary" />
          <div>
            <p className="text-5xl md:text-7xl font-bold">
              {Math.round(weather.current.temperature_2m)}°
            </p>
            <p className="text-muted-foreground">
              {weather.current_units.temperature_2m}
            </p>
          </div>
        </div>

        <div className="flex justify-around items-center text-center border-t border-border/50 pt-4">
          <div className="flex flex-col items-center gap-1">
            <Wind className="w-6 h-6 text-muted-foreground" />
            <p className="font-bold">{weather.current.wind_speed_10m}{weather.current_units.wind_speed_10m}</p>
            <p className="text-xs text-muted-foreground">Wind</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Thermometer className="w-6 h-6 text-muted-foreground" />
             <p className="font-bold">{Math.round(today.temperature_2m_max[0])}° / {Math.round(today.temperature_2m_min[0])}°</p>
            <p className="text-xs text-muted-foreground">High / Low</p>
          </div>
        </div>

         <div className="flex justify-around items-center text-center border-t border-border/50 pt-4 mt-4">
          <div className="flex flex-col items-center gap-1">
            <Sunrise className="w-6 h-6 text-muted-foreground" />
            <p className="font-bold">{new Date(today.sunrise[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            <p className="text-xs text-muted-foreground">Sunrise</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Sunset className="w-6 h-6 text-muted-foreground" />
             <p className="font-bold">{new Date(today.sunset[0]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            <p className="text-xs text-muted-foreground">Sunset</p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export { WeatherWidget };
