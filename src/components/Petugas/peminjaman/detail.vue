<script setup>
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import Button from '@/components/ui/button/Button.vue'
import { Check, X } from 'lucide-vue-next'

defineProps({
    open: Boolean,
    peminjaman: {
        type: Object,
        default: null,
    },
})

const emit = defineEmits(['update:open'])
</script>

<template>
    <Dialog :open="open" 
    @update:open="emit('update:open', $event)"
    >
        <DialogContent class="sm:max-w-[730px] w-[95vw] p-0 gap-0 overflow-hidden rounded-[24px] border border-gray-300"
            :show-close-button="false">
            <!-- Header -->
            <DialogHeader class="flex flex-row items-center justify-between px-8 py-6 border-b border-gray-300">
                <DialogTitle class="text-2xl font-black tracking-[0.12em]">
                    DETAIL PENGAJUAN PEMINJAMAN
                </DialogTitle>

                <button type="button" class="text-black hover:text-gray-500" @click="emit('update:open', false)">
                    <X :size="30" :stroke-width="3" />
                </button>
            </DialogHeader>

            <div v-if="peminjaman" class="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 md:gap-12 p-8 md:p-10">
                <!-- Gambar alat -->
                <div
                    class="flex items-center justify-center w-full h-[260px] rounded-[24px] border-[10px] border-gray-100 overflow-hidden">
                    <img v-if="peminjaman.gambar" :src="peminjaman.gambar" :alt="peminjaman.alat"
                        class="w-full h-full object-contain" />

                    <span v-else class="text-sm text-gray-400">
                        Gambar tidak tersedia
                    </span>
                </div>

                <!-- Detail peminjaman -->
                <div class="space-y-4 text-base">
                    <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                        <span class="text-gray-500">ID Peminjaman</span>
                        <span>:</span>
                        <span class="font-semibold">{{ peminjaman.id }}</span>
                    </div>

                    <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                        <span class="text-gray-500">Nama Peminjam</span>
                        <span>:</span>
                        <span class="font-semibold">{{ peminjaman.peminjam }}</span>
                    </div>

                    <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                        <span class="text-gray-500">Alat</span>
                        <span>:</span>
                        <span class="font-semibold">{{ peminjaman.alat }}</span>
                    </div>

                    <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                        <span class="text-gray-500">Tanggal Pinjam</span>
                        <span>:</span>
                        <span class="font-semibold">{{ peminjaman.tanggal_pinjam }}</span>
                    </div>

                    <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                        <span class="text-gray-500">Tanggal Kembali</span>
                        <span>:</span>
                        <span class="font-semibold">{{ peminjaman.tanggal_kembali }}</span>
                    </div>

                    <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                        <span class="text-gray-500">Keperluan</span>
                        <span>:</span>
                        <span class="font-semibold">{{ peminjaman.keperluan || '-' }}</span>
                    </div>

                    <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                        <span class="text-gray-500">Status</span>
                        <span>:</span>
                        <span class="font-semibold">{{ peminjaman.status }}</span>
                    </div>
                </div>
            </div>

            <DialogFooter class="border-t border-gray-200 px-8 py-4">
                <Button variant="outline" class="border-black text-black hover:bg-gray-100" type="submit" :disabled="loading">
                    <X :size="18" />
                    {{
                        loading
                            ? 'Menyetujui...'
                            : isEditMode
                                ? 'Simpan Perubahan'
                                : 'Tolak'
                    }}
                </Button>
                <Button type="submit" :disabled="loading">
                    <Check :size="18" />
                    {{
                        loading
                            ? 'Menyetujui...'
                            : isEditMode
                                ? 'Simpan Perubahan'
                                : 'Setujui'
                    }}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
