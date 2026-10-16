
<script setup>
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

import { X } from 'lucide-vue-next'

defineProps({
    open: Boolean,
    alat: {
        type: Object,
        default: null,
    },
})

const emit = defineEmits(['update:open'])
</script>

<template>
    <Dialog
        :open="open"
        @update:open="emit('update:open', $event)"
    >
        <DialogContent
            class="sm:max-w-[850px] w-[95vw] p-0 gap-0 overflow-hidden rounded-[24px] border border-gray-300"
            :show-close-button="false"
        >
            <!-- Header -->
            <DialogHeader
                class="flex flex-row items-center justify-between px-8 py-6 border-b border-gray-300"
            >
                <DialogTitle class="text-2xl font-black tracking-[0.12em]">
                    DETAIL ALAT
                </DialogTitle>

                <button
                    type="button"
                    class="text-black hover:text-gray-500"
                    @click="emit('update:open', false)"
                >
                    <X :size="30" :stroke-width="3" />
                </button>
            </DialogHeader>

            <div
                v-if="alat"
                class="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 md:gap-12 p-8 md:p-10"
            >
                <div
                    class="flex items-center justify-center w-full h-[280px] rounded-[24px] border-[10px] border-gray-100 overflow-hidden"
                >
                    <img
                        v-if="alat.gambar"
                        :src="alat.gambar"
                        :alt="alat.nama_alat"
                        class="w-full h-full object-contain"
                    />

                    <span v-else class="text-sm text-gray-400">
                        Gambar tidak tersedia
                    </span>
                </div>

                <div class="space-y-4 text-base">
                    <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                        <span class="text-gray-500">Nama Alat</span>
                        <span>:</span>
                        <span class="font-semibold">{{ alat.nama_alat }}</span>
                    </div>

                    <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                        <span class="text-gray-500">ID Alat</span>
                        <span>:</span>
                        <span class="font-semibold">{{ alat.kode_alat }}</span>
                    </div>

                    <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                        <span class="text-gray-500">Kategori</span>
                        <span>:</span>
                        <span class="font-semibold">{{ alat.kategori }}</span>
                    </div>

                    <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                        <span class="text-gray-500">Stok</span>
                        <span>:</span>
                        <span class="font-semibold">{{ alat.jumlah }} unit</span>
                    </div>

                    <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                        <span class="text-gray-500">Tersedia</span>
                        <span>:</span>
                        <span class="font-semibold">{{ alat.tersedia }} unit</span>
                    </div>

                    <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                        <span class="text-gray-500">Kondisi</span>
                        <span>:</span>
                        <span class="font-semibold">{{ alat.kondisi || '-' }}</span>
                    </div>

                    <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                        <span class="text-gray-500">Status</span>
                        <span>:</span>
                        <span class="font-semibold">{{ alat.status }}</span>
                    </div>

                    <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                        <span class="text-gray-500">Deskripsi</span>
                        <span>:</span>
                        <span class="font-semibold">
                            {{ alat.deskripsi || '-' }}
                        </span>
                    </div>
                </div>
            </div>
        </DialogContent>
    </Dialog>
</template>
