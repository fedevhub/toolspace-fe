<script setup>
import { ref } from 'vue'
import Table from '@/components/Petugas/pengembalian/table.vue';
import { Input } from '@/components/ui/input';
import { Plus, Search, ChevronDown } from 'lucide-vue-next'
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
</script>

<template>
    <div class="p-8">
        <h1 class="text-3xl font-bold">Persetujuan Pengembalian</h1>
        <p class="font-medium text-gray-500">Kelola dan verifikasi pengajuan pengembalian alat.</p>
        <div class="flex w-full items-center py-5">
            <div class="relative w-75">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />

                <Input type="text" placeholder="Cari" class="bg-white pl-10" />
            </div>

            <div class="ml-auto flex items-center gap-3">
                <!-- Dropdown Menu -->
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
        <Table />
    </div>
</template>