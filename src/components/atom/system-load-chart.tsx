
"use client"

import { useState } from "react"
import { useInterval } from "react-use"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { api } from "@/lib/api"
import { Cpu, Thermometer } from "lucide-react"

const MAX_DATA_POINTS = 30

export function SystemLoadChart() {
  const [data, setData] = useState<{ time: string; cpu: number; temp: number }[]>(
    []
  )

  useInterval(async () => {
    try {
      const res = await api("/api/system/load")
      if (res.ok) {
        const { cpuLoad, temperature } = await res.json()
        const now = new Date()
        const newEntry = {
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          cpu: Math.round(cpuLoad * 100),
          temp: Math.round(temperature),
        }
        setData((prevData) => [...prevData.slice(-MAX_DATA_POINTS + 1), newEntry])
      }
    } catch (e) {
      console.error("Failed to fetch system load", e)
    }
  }, 2000)

  return (
    <Card className="w-full h-full bg-card/50 backdrop-blur-sm flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-primary flex items-center gap-2">
            <Cpu />
            Core System Vitals
        </CardTitle>
        <CardDescription>
          Real-time CPU load and core temperature metrics.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <ChartContainer
          config={{
            cpu: {
              label: "CPU",
              color: "hsl(var(--chart-1))",
              icon: Cpu,
            },
            temp: {
              label: "Temp",
              color: "hsl(var(--chart-2))",
              icon: Thermometer,
            },
          }}
          className="h-full w-full"
        >
          <AreaChart
            data={data}
            margin={{
              left: -20,
              right: 16,
              top: 4,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="cpu"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
             <YAxis
              yAxisId="temp"
              orientation="right"
              domain={[30, 90]}
              tickFormatter={(value) => `${value}°C`}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <defs>
                <linearGradient id="fillCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="fillTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
                </linearGradient>
            </defs>
            <Area
              dataKey="cpu"
              yAxisId="cpu"
              type="natural"
              fill="url(#fillCpu)"
              stroke="hsl(var(--chart-1))"
              stackId="a"
            />
             <Area
              dataKey="temp"
              yAxisId="temp"
              type="natural"
              fill="url(#fillTemp)"
              stroke="hsl(var(--chart-2))"
              stackId="b"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
