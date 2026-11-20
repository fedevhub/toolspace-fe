<script setup>
import { computed, onMounted, ref } from 'vue'
import { CalendarRange, TrendingUp } from 'lucide-vue-next'
import {
  VisAxis,
  VisGroupedBar,
  VisXYContainer,
} from '@unovis/vue'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartCrosshair,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
} from '@/components/ui/chart'
import { getPeminjaman } from '@/services/peminjamanService'

const daftarPeminjaman = ref([])
const loading = ref(true)

const chartConfig = {
  peminjaman: {
    label: 'Peminjaman',
    color: '#000000',
  },
}

// Helper: Mengubah format DD/MM/YYYY atau DD-MM-YYYY atau ISO ke Date lokal (00:00:00)
function parseTanggalLokal(value) {
  if (!value) return null
  const str = String(value).trim()

  // Format DD/MM/YYYY atau DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/)
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  // Format YYYY-MM-DD (ISO)
  const ymdMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (ymdMatch) {
    const [, year, month, day] = ymdMatch
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  const parsed = new Date(str)
  if (Number.isNaN(parsed.getTime())) return null
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

// Menghasilkan 7 hari dalam minggu berjalan (Senin s/d Minggu)
const hariMingguIni = computed(() => {
  const sekarang = new Date()
  const hariIni = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate())
  const dayOfWeek = hariIni.getDay() // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  const selisihKeSenin = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const senin = new Date(hariIni)
  senin.setDate(hariIni.getDate() + selisihKeSenin)

  return Array.from({ length: 7 }, (_, index) => {
    const d = new Date(senin)
    d.setDate(senin.getDate() + index)
    return d
  })
})

// Data chart dinamis berdasarkan tanggal_pinjam
const chartData = computed(() => {
  const jumlahPerHari = hariMingguIni.value.map((tanggal) => {
    const count = daftarPeminjaman.value.filter((item) => {
      const tglPinjam = parseTanggalLokal(item.tanggal_pinjam || item.created_at)
      return (
        tglPinjam &&
        tglPinjam.getFullYear() === tanggal.getFullYear() &&
        tglPinjam.getMonth() === tanggal.getMonth() &&
        tglPinjam.getDate() === tanggal.getDate()
      )
    }).length

    return {
      date: tanggal,
      peminjaman: count,
    }
  })

  // Tinggi background bar mengikuti nilai tertinggi minggu ini (minimal 10 agar proporsional)
  const nilaiMaks = Math.max(10, ...jumlahPerHari.map((d) => d.peminjaman))
  const batasAtas = Math.ceil(nilaiMaks / 5) * 5

  return jumlahPerHari.map((item) => ({
    ...item,
    total: batasAtas,
  }))
})

const totalMingguIni = computed(() =>
  chartData.value.reduce((acc, item) => acc + item.peminjaman, 0)
)

const rentangTanggalTeks = computed(() => {
  const awal = hariMingguIni.value[0]
  const akhir = hariMingguIni.value[6]
  if (!awal || !akhir) return ''

  const fmt = (d) =>
    d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  return `${fmt(awal)} – ${fmt(akhir)} ${akhir.getFullYear()}`
})

const getDate = (d) => d.date
const getPeminjamanVal = (d) => d.peminjaman
const getTotal = (d) => d.total

const formatDay = (value) => {
  const date = new Date(value)
  return date.toLocaleDateString('id-ID', { weekday: 'short' })
}

onMounted(async () => {
  loading.value = true
  try {
    const response = await getPeminjaman()
    const hasil = response.data?.data ?? response.data
    daftarPeminjaman.value = Array.isArray(hasil) ? hasil : []
  } catch (error) {
    console.error('Gagal memuat data grafik peminjaman:', error)
    daftarPeminjaman.value = []
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="grid grid-cols-1 gap-4 py-3 md:grid-cols-2" style="font-family: 'DM Sans', Arial, sans-serif">
    <Card class="rounded-2xl border border-gray-200/80 bg-white shadow-xs">
      <CardHeader class="pb-2">
        <CardTitle class="font-display text-lg font-bold tracking-wide text-black">
          PEMINJAMAN MINGGU INI
        </CardTitle>
        <CardDescription class="text-xs text-[#697386]">
          {{ rentangTanggalTeks }} • Total {{ totalMingguIni }} transaksi
        </CardDescription>
      </CardHeader>

      <CardContent class="pt-4">
        <div v-if="loading" class="h-64 w-full animate-pulse rounded-xl bg-gray-100" />

        <ChartContainer v-else :config="chartConfig" class="h-64 w-full">
          <VisXYContainer :data="chartData" :height="250">
            <VisGroupedBar :x="getDate" :y="[getTotal]" :color="['#8888881A']" :rounded-corners="6" :bar-padding="0.2"
              :group-padding="0" />
            <VisGroupedBar :x="getDate" :y="[getPeminjamanVal]" :color="['#000000']" :rounded-corners="6"
              :bar-padding="0.2" :group-padding="0" />
            <VisAxis type="x" :x="getDate" :tick-line="false" :domain-line="false" :grid-line="false" :num-ticks="7"
              :tick-format="formatDay" :tick-values="chartData.map((d) => d.date)" />
            <VisAxis type="y" :num-ticks="4" :tick-line="false" :domain-line="false" />
            <ChartTooltip />
            <ChartCrosshair :template="componentToString(chartConfig, ChartTooltipContent, {
              indicator: 'dashed',
              hideLabel: true,
            })
              " color="#0000" />
          </VisXYContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  </div>
</template>