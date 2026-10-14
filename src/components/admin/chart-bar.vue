<script setup>
import { TrendingUp } from 'lucide-vue-next'

import {
  VisAxis,
  VisGroupedBar,
  VisXYContainer
} from '@unovis/vue'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import {
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  componentToString
} from '@/components/ui/chart'

const chartData = [
  { date: new Date('2026-10-05'), peminjaman: 12, total: 30 },
  { date: new Date('2026-10-06'), peminjaman: 18, total: 30 },
  { date: new Date('2026-10-07'), peminjaman: 9, total: 30 },
  { date: new Date('2026-10-08'), peminjaman: 25, total: 30 },
  { date: new Date('2026-10-09'), peminjaman: 15, total: 30 },
  { date: new Date('2026-10-10'), peminjaman: 30,total: 30 },
  { date: new Date('2026-10-11'), peminjaman: 21, total: 30 }
]

const chartConfig = {
  peminjaman: {
    label: 'Peminjaman',
    color: '#000000'
  },
}

const getDate = (d) => d.date
const getPeminjaman = (d) => d.peminjaman
const getTotal = (d) => d.total

const formatDay = (value) => {
  const date = new Date(value)

  return date.toLocaleDateString('id-ID', {
    weekday: 'short'
  })
}
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 py-3">
        <Card>
            <CardHeader>
                <CardTitle>Peminjaman Minggu Ini</CardTitle>
            </CardHeader>

            <CardContent>
        <ChartContainer :config="chartConfig" class="h-72 w-full">
            <VisXYContainer :data="chartData" :height="280">
            <!-- Background abu-abu: harus pertama -->
            <VisGroupedBar
            :x="getDate"
            :y="[getTotal]"
            :color="['#8888881A']"
            :rounded-corners="4"
            bar-padding="0.15"
            group-padding="0"
            />

            <!-- Bar maroon: harus setelah background -->
            <VisGroupedBar
            :x="getDate"
            :y="[getPeminjaman]"
            :color="['#000000']"
            :rounded-corners="4"
            bar-padding="0.15"
            group-padding="0"
            />

            <VisAxis
                type="x"
                :x="getDate"
                :tick-line="false"
                :domain-line="false"
                :grid-line="false"
                :num-ticks="6"
                :tick-format="formatDay"
                :tick-values="chartData.map((d) => d.date)"
            />

            <VisAxis
                type="y"
                :num-ticks="4"
                :tick-line="false"
                :domain-line="false"
            />
            <ChartTooltip />

            <ChartCrosshair
                :template="
                componentToString(chartConfig, ChartTooltipContent, {
                    indicator: 'dashed',
                    hideLabel: true
                })
                "
                color="#0000"
            />
            </VisXYContainer>
        </ChartContainer>
        </CardContent>
    </Card>
    </div>
</template>