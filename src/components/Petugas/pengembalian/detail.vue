<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { Check, ChevronDown, X } from 'lucide-vue-next'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import Button from '@/components/ui/button/Button.vue'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { detailPeminjaman } from '@/services/peminjamanService'

const props = defineProps({
    open: Boolean,
    pengembalian: { type: Object, default: null },
    loading: Boolean,
    errorMessage: { type: String, default: '' },
})
const emit = defineEmits(['update:open', 'setujui', 'tolak'])

const form = reactive({ kondisi: '', denda: 0 })
const gambar = ref('')

watch(
    () => [props.open, props.pengembalian],
    async ([buka, item]) => {
        if (!buka || !item) return
        form.kondisi = item.kondisi || ''
        form.denda = item.denda || 0
        gambar.value = ''
        try {
            const response = await detailPeminjaman(item.id)
            gambar.value = response.data.gambar || ''
        } catch (error) {
            console.error('Gagal mengambil gambar alat:', error)
        }
    },
    { immediate: true }
)

const dendaText = computed({
    get: () => (form.denda ? Number(form.denda).toLocaleString('id-ID') : ''),
    set: (nilai) => {
        form.denda = Number(String(nilai).replace(/\D/g, '')) || 0
    },
})

const sudahKembali = computed(() => Boolean(props.pengembalian?.sudah_kembali))
const bisaSetujui = computed(() => !sudahKembali.value && Boolean(form.kondisi))

const baris = computed(() => {
    const item = props.pengembalian
    if (!item) return []
    return [
        ['Nama peminjam', item.nama_peminjam],
        ['Alat', item.alat],
        ['Jumlah', item.jumlah],
        ['Tanggal Pinjam', item.tanggal_pinjam],
        ['Batas Kembali', item.batas_kembali],
        ['Tanggal Kembali', item.tanggal_kembali || item.tanggal_pengajuan || '-'],
        ['Keterlambatan', `${item.keterlambatan} hari`],
    ]
})

function setujui() {
    emit('setujui', { kondisi: form.kondisi, denda: form.denda })
}
</script>

<template>
    <Dialog :open="open" @update:open="emit('update:open', $event)">
        <DialogContent :show-close-button="false"
            class="max-h-[92vh] w-[95vw] gap-0 overflow-y-auto rounded-[22px] border border-gray-200 p-0 sm:max-w-[790px]"
            style="font-family: 'DM Sans', Arial, sans-serif">
            <DialogHeader class="flex flex-row items-center justify-between border-b border-gray-300 px-12 py-6">
                <DialogTitle class="font-display text-xl uppercase">Detail Pengembalian</DialogTitle>
                <DialogDescription class="sr-only">Detail dan verifikasi pengembalian alat</DialogDescription>
                <button type="button" class="text-black hover:text-gray-500" aria-label="Tutup"
                    @click="emit('update:open', false)">
                    <X :size="28" :stroke-width="3" />
                </button>
            </DialogHeader>

            <div v-if="pengembalian" class="px-12 pt-7 pb-8">
                <div class="flex items-start justify-between gap-8">
                    <div class="space-y-3 text-[15px]">
                        <div v-for="[label, nilai] in baris" :key="label" class="grid grid-cols-[130px_16px_1fr]">
                            <span class="text-gray-500">{{ label }}</span>
                            <span>:</span>
                            <span class="font-medium">{{ nilai }}</span>
                        </div>
                    </div>

                    <div
                        class="flex h-[206px] w-[206px] shrink-0 items-center justify-center overflow-hidden rounded-[22px] border-[8px] border-gray-100 bg-white">
                        <img v-if="gambar" :src="gambar" :alt="pengembalian.alat"
                            class="h-full w-full object-contain" />
                        <span v-else class="px-2 text-center text-xs text-gray-400">Gambar tidak tersedia</span>
                    </div>
                </div>

                <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:pr-[240px]">
                    <div class="space-y-2">
                        <label class="text-[15px] font-medium">
                            Kondisi <span class="text-[#DC2626]">*</span>
                        </label>
                        <Select v-model="form.kondisi" :disabled="sudahKembali">
                            <SelectTrigger class="!h-12 w-full">
                                <SelectValue placeholder="Pilih kondisi alat" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Baik">Baik</SelectItem>
                                <SelectItem value="Rusak Ringan">Rusak Ringan</SelectItem>
                                <SelectItem value="Rusak Berat">Rusak Berat</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div class="space-y-2">
                        <label class="text-[15px] font-medium">Denda</label>
                        <Input v-model="dendaText" type="text" inputmode="numeric" placeholder="0"
                            :disabled="sudahKembali" class="h-12" />
                    </div>
                </div>

                <p v-if="errorMessage" role="alert" class="mt-4 text-sm text-red-600">{{ errorMessage }}</p>

                <div v-if="!sudahKembali" class="mt-6 flex justify-end gap-3">
                    <Button v-if="pengembalian.diajukan" variant="outline"
                        class="h-11 gap-2 border-black px-6 text-black hover:bg-gray-100" :disabled="loading"
                        @click="emit('tolak')">
                        <X :size="18" /> Tolak
                    </Button>
                    <Button class="h-11 gap-2 px-6" :disabled="loading || !bisaSetujui" @click="setujui">
                        <Check :size="18" /> Setujui
                    </Button>
                </div>
                <p v-else class="mt-6 text-right text-sm text-gray-500">
                    Pengembalian ini sudah selesai diproses.
                </p>
            </div>
        </DialogContent>
    </Dialog>
</template>