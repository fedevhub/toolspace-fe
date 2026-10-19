<script setup>
import { reactive, ref, watch } from 'vue'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import Button from '@/components/ui/button/Button.vue'
import { Check, X } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

const props = defineProps({
    open: Boolean,
    pengembalian: {
        type: Object,
        default: null,
    },
})

const emit = defineEmits(['update:open'])

// State untuk form dan loading
const loading = ref(false)
const isEditMode = ref(false)

const form = reactive({
    kondisi: '',
    denda: '',
})

// Reset atau sinkronisasi data saat modal dibuka
watch(() => props.pengembalian, (newVal) => {
    if (newVal) {
        form.kondisi = newVal.kondisi || ''
        form.denda = newVal.denda || ''
    }
})
</script>

<template>
    <!-- Perbaikan: Tambahkan @update:open agar tombol X bawaan/luar ikut berfungsi menutup dialog -->
    <Dialog :open="open" @update:open="emit('update:open', $event)">
        <DialogContent
            class="sm:max-w-[730px] w-[95vw] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-[24px] border border-gray-300"
            :show-close-button="false">

            <!-- Header -->
            <DialogHeader
                class="flex flex-row items-center justify-between px-8 py-6 border-b border-gray-300 shrink-0">
                <DialogTitle class="text-2xl font-black tracking-[0.12em]">
                    DETAIL PENGAJUAN PENGEMBALIAN
                </DialogTitle>

                <!-- Perbaikan: Tombol X diberi fungsi untuk menutup dialog -->
                <button type="button" class="text-black hover:text-gray-500 cursor-pointer"
                    @click="emit('update:open', false)">
                    <X :size="30" :stroke-width="3" />
                </button>
            </DialogHeader>

            <!-- Scrollable Content -->
            <div v-if="pengembalian" class="overflow-y-auto flex-1 p-8 md:p-10 space-y-8">

                <!-- Bagian atas: Gambar dan Detail (Grid 2 Kolom) -->
                <div class="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 md:gap-12">
                    <!-- Gambar alat -->
                    <div
                        class="flex items-center justify-center w-full h-[260px] rounded-[24px] border-[10px] border-gray-100 overflow-hidden shrink-0">
                        <img v-if="pengembalian.gambar" :src="pengembalian.gambar" :alt="pengembalian.alat"
                            class="w-full h-full object-contain" />

                        <span v-else class="text-sm text-gray-400">
                            Gambar tidak tersedia
                        </span>
                    </div>

                    <!-- Detail peminjaman -->
                    <div class="space-y-4 text-base">
                        <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                            <span class="text-gray-500">ID Pengembalian</span>
                            <span>:</span>
                            <span class="font-semibold">{{ pengembalian.id }}</span>
                        </div>

                        <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                            <span class="text-gray-500">Nama Peminjam</span>
                            <span>:</span>
                            <span class="font-semibold">{{ pengembalian.peminjam }}</span>
                        </div>

                        <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                            <span class="text-gray-500">Alat</span>
                            <span>:</span>
                            <span class="font-semibold">{{ pengembalian.alat }}</span>
                        </div>

                        <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                            <span class="text-gray-500">Tanggal Pinjam</span>
                            <span>:</span>
                            <span class="font-semibold">{{ pengembalian.tanggal_pinjam }}</span>
                        </div>

                        <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                            <span class="text-gray-500">Batas Kembali</span>
                            <span>:</span>
                            <span class="font-semibold">{{ pengembalian.batas_kembali }}</span>
                        </div>

                        <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                            <span class="text-gray-500">Tanggal Kembali</span>
                            <span>:</span>
                            <span class="font-semibold">{{ pengembalian.tanggal_kembali }}</span>
                        </div>

                        <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                            <span class="text-gray-500">Jumlah</span>
                            <span>:</span>
                            <span class="font-semibold">{{ pengembalian.jumlah || '-' }}</span>
                        </div>

                        <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                            <span class="text-gray-500">Keterlambatan</span>
                            <span>:</span>
                            <span class="font-semibold">{{ pengembalian.keterlambatan || '-' }}</span>
                        </div>

                        <div class="grid grid-cols-[130px_10px_1fr] gap-3">
                            <span class="text-gray-500">Status</span>
                            <span>:</span>
                            <span class="font-semibold">{{ pengembalian.status }}</span>
                        </div>
                    </div>
                </div>

                <!-- Bagian Bawah: Form Input & Select (Kondisi & Denda) Berjajar 2 Kolom -->
                <div class="border-t border-gray-200 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label for="kondisi" class="text-sm font-medium text-gray-800">
                            Kondisi <span class="text-[#DC2626]">*</span>
                        </label>

                        <Select v-model="form.kondisi">
                            <SelectTrigger id="kondisi" class="h-12 w-full">
                                <SelectValue placeholder="Pilih kondisi alat" />
                            </SelectTrigger>

                            <SelectContent>
                                <SelectItem value="Baik">Baik</SelectItem>
                                <SelectItem value="Rusak">Rusak</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div class="space-y-2">
                        <label for="denda" class="text-sm font-medium text-gray-800">
                            Denda
                        </label>

                        <Input id="denda" v-model="form.denda" type="text" placeholder="Masukkan nominal denda"
                            class="h-9" />
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <DialogFooter class="border-t border-gray-200 px-8 py-4 shrink-0">
                <Button variant="outline" class="border-black text-black hover:bg-gray-100" type="button"
                    :disabled="loading" @click="emit('update:open', false)">
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