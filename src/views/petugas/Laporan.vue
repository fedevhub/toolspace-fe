<script setup>
import { ref } from 'vue'
import Table from '@/components/Petugas/laporan/table.vue';
import { Input } from '@/components/ui/input';
import { Plus, Search, ChevronDown, ArrowRight, Printer } from 'lucide-vue-next'
import Calendar from '@/components/ui/calendar/Calendar.vue'
import Button from '@/components/ui/button/Button.vue';
import { useRouter } from 'vue-router'

const router = useRouter()
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date'
import { CalendarIcon } from '@lucide/vue'
import { cn } from '@/lib/utils'
const date = ref()
const defaultPlaceholder = today(getLocalTimeZone())
</script>

<template>
    <div class="p-8">
        <h1 class="text-3xl font-bold">Laporan</h1>
        <p class="font-medium text-gray-500">Lihat laporan aktivitas peminjaman dan pengembalian alat.</p>

        <div class="flex w-full items-center pt-5 pb-2">
            <div class="flex items-end justify-between gap-4 w-full">
                <!-- Bagian Kiri: Periode & Rentang Kalender -->
                <div class="flex flex-col gap-2">
                    <p class="font-medium text-sm">Periode</p>

                    <div class="flex items-center gap-3">
                        <!-- Kalender Pertama -->
                        <Popover>
                            <PopoverTrigger as-child>
                                <Button variant="outline" :class="cn(
                                    'w-[160px] justify-start text-left font-normal',
                                    !dateStart && 'text-muted-foreground',
                                )">
                                    <CalendarIcon class="mr-2 h-4 w-4" />
                                    {{ dateStart ? dateStart.toDateString() : "DD/MM/YYYY" }}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent class="w-auto p-0">
                                <Calendar v-model="dateStart" :initial-focus="true"
                                    :default-placeholder="defaultPlaceholder" layout="month-and-year" />
                            </PopoverContent>
                        </Popover>

                        <div>
                            <ArrowRight size="18" class="text-muted-foreground" />
                        </div>

                        <!-- Kalender Kedua -->
                        <Popover>
                            <PopoverTrigger as-child>
                                <Button variant="outline" :class="cn(
                                    'w-[160px] justify-start text-left font-normal',
                                    !dateEnd && 'text-muted-foreground',
                                )">
                                    <CalendarIcon class="mr-2 h-4 w-4" />
                                    {{ dateEnd ? dateEnd.toDateString() : "DD/MM/YYYY" }}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent class="w-auto p-0">
                                <Calendar v-model="dateEnd" :initial-focus="true"
                                    :default-placeholder="defaultPlaceholder" layout="month-and-year" />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <!-- Bagian Kanan: Dropdown Menu / Tombol Aksi -->
                <div class="flex items-center gap-3">
                    <Button @click="router.push('/admin/peminjaman-form')" class="gap-2">
                        <Printer :size="20" />
                        Cetak Laporan
                    </Button>
                </div>
            </div>
        </div>
  
        <div class="flex w-full items-center mt-1">
            <div class="relative w-75">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />

                <Input type="text" placeholder="Cari" class="bg-white pl-10" />
            </div>

            <div class="ml-auto flex items-center gap-3">
                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <Button variant="outline" class="gap-2">
                            Alat
                            <ChevronDown :size="16" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Menu Peminjaman</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Ekspor Data</DropdownMenuItem>
                        <DropdownMenuItem>Unduh Laporan</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              
                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <Button variant="outline" class="gap-2">
                            Status
                            <ChevronDown :size="16" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Menu Peminjaman</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Ekspor Data</DropdownMenuItem>
                        <DropdownMenuItem>Unduh Laporan</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            </div>
        </div>
        <div class="py-5">
            <Table />
        </div>
        
    </div>
</template>