<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Image as ImageIcon, Save } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    detailAlat,
    editAlat,
    reserveKodeAlat,
    tambahAlat,
} from '@/services/alatService'
import { getKategori } from '@/services/kategoriService'
const route = useRoute()
const router = useRouter()
const alatId = computed(() => route.params.id)
const isEditMode = computed(() => Boolean(alatId.value))
const loading = ref(false)
const errorMessage = ref('')
const daftarKategori = ref([])
const form = ref({
    kode_alat: '',
    reservation_token: '',
    nama_alat: '',
    kategori: '',
    jumlah: 0,
    kondisi: '',
    deskripsi: '',
    gambar: '',
    status_aktif: true,
})

async function ambilKodeBerikutnya() {
    const response = await reserveKodeAlat()
    form.value.kode_alat = response.data.kode_alat
    form.value.reservation_token = response.data.token
}

onMounted(async () => {
    loading.value = true
    try {
        const kategoriResponse = await getKategori()
        if (!Array.isArray(kategoriResponse.data)) {
            throw new TypeError('Respons API kategori tidak berisi daftar kategori.')
        }
        daftarKategori.value = kategoriResponse.data

        if (isEditMode.value) {
            const response = await detailAlat(alatId.value)
            form.value = { ...form.value, ...response.data }
        } else {
            await ambilKodeBerikutnya()
        }
    } catch (error) {
        console.error('Gagal memuat form alat:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal memuat data alat.'
    } finally {
        loading.value = false
    }
})

function pilihFoto(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!['image/png', 'image/jpeg'].includes(file.type)) {
        errorMessage.value = 'Format foto harus PNG atau JPG.'
        event.target.value = ''
        return
    }

    if (file.size > 5 * 1024 * 1024) {
        errorMessage.value = 'Ukuran foto maksimal 5 MB.'
        event.target.value = ''
        return
    }

    errorMessage.value = ''
    const reader = new FileReader()
    reader.onload = () => {
        if (typeof reader.result !== 'string') {
            errorMessage.value = 'Foto gagal dibaca. Silakan pilih ulang.'
            return
        }
        form.value.gambar = reader.result
    }
    reader.onerror = () => {
        errorMessage.value = 'Foto gagal dibaca. Silakan pilih ulang.'
    }
    reader.readAsDataURL(file)
}

async function handleSubmit() {
    errorMessage.value = ''
    if (!form.value.nama_alat.trim() || !form.value.kategori || !form.value.kondisi) {
        errorMessage.value = 'Nama alat, kategori, dan kondisi wajib diisi.'
        return
    }
    if (!Number.isSafeInteger(Number(form.value.jumlah)) || Number(form.value.jumlah) < 0) {
        errorMessage.value = 'Jumlah harus berupa bilangan bulat nol atau lebih.'
        return
    }
    if (!form.value.gambar) {
        errorMessage.value = 'Foto alat wajib diunggah.'
        return
    }
    if (!isEditMode.value && (!form.value.kode_alat || !form.value.reservation_token)) {
        errorMessage.value = 'ID alat belum berhasil dicadangkan. Muat ulang halaman untuk mencoba lagi.'
        return
    }

    loading.value = true
    const data = {
        nama_alat: form.value.nama_alat.trim(),
        kategori: form.value.kategori,
        jumlah: Number(form.value.jumlah),
        kondisi: form.value.kondisi,
        deskripsi: form.value.deskripsi.trim(),
        gambar: form.value.gambar,
        status_aktif: form.value.status_aktif,
        ...(!isEditMode.value
            ? {
                kode_alat: form.value.kode_alat,
                reservation_token: form.value.reservation_token,
            }
            : {}),
    }

    try {
        if (isEditMode.value) {
            await editAlat(alatId.value, data)
        } else {
            await tambahAlat(data)
        }
        await router.push('/admin/alat')
    } catch (error) {
        console.error('Gagal menyimpan alat:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal menyimpan alat.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="px-8 pb-16 pt-8 md:px-20">
        <Button type="button" variant="outline" class="gap-2" @click="router.push('/admin/alat')">
            <ArrowLeft :size="16" />
            Kembali
        </Button>

        <h1 class="pt-3 text-3xl font-bold">{{ isEditMode ? 'Edit Alat' : 'Tambah Alat Baru' }}</h1>

        <form class="mt-4 rounded-xl border bg-white p-6 shadow-sm md:p-8" @submit.prevent="handleSubmit">
            <div v-if="loading" class="py-4 text-gray-500">Memuat data alat...</div>
            <div v-else class="grid grid-cols-1 items-start gap-x-7 gap-y-4 md:grid-cols-2">
                <div>
                    <label for="nama_alat" class="mb-2 block text-sm font-medium text-gray-800">
                        Nama Alat <span class="text-red-600">*</span>
                    </label>
                    <Input
                        id="nama_alat"
                        v-model="form.nama_alat"
                        maxlength="120"
                        placeholder="Masukkan nama alat"
                        required
                    />
                </div>

                <div>
                    <label for="kode_alat" class="mb-2 block text-sm font-medium text-gray-800">
                        Kode Alat <span class="text-red-600">*</span>
                    </label>
                    <Input
                        id="kode_alat"
                        :model-value="form.kode_alat"
                        placeholder="Kode dibuat otomatis"
                        disabled
                    />
                </div>

                <div>
                    <label for="kategori" class="mb-2 block text-sm font-medium text-gray-800">
                        Kategori <span class="text-red-600">*</span>
                    </label>
                    <Select v-model="form.kategori" required>
                        <SelectTrigger id="kategori" class="w-full">
                            <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem
                                v-for="kategori in daftarKategori"
                                :key="kategori.id"
                                :value="kategori.nama_kategori"
                            >
                                {{ kategori.nama_kategori }}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label for="jumlah" class="mb-2 block text-sm font-medium text-gray-800">
                        Jumlah <span class="text-red-600">*</span>
                    </label>
                    <Input
                        id="jumlah"
                        v-model="form.jumlah"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Masukkan Jumlah"
                        required
                    />
                </div>

                <div>
                    <label for="kondisi" class="mb-2 block text-sm font-medium text-gray-800">
                        Kondisi <span class="text-red-600">*</span>
                    </label>
                    <Select v-model="form.kondisi" required>
                        <SelectTrigger id="kondisi" class="w-full">
                            <SelectValue placeholder="Pilih Kondisi" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Baik">Baik</SelectItem>
                            <SelectItem value="Rusak Ringan">Rusak Ringan</SelectItem>
                            <SelectItem value="Rusak Berat">Rusak Berat</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label for="gambar" class="mb-2 block text-sm font-medium text-gray-800">
                        Foto Alat <span class="text-red-600">*</span>
                    </label>
                    <label
                        for="gambar"
                        class="flex min-h-[62px] cursor-pointer items-center gap-4 rounded-xl border border-gray-200 px-4 py-2 hover:bg-gray-50"
                    >
                        <span class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                            <img v-if="form.gambar" :src="form.gambar" alt="Pratinjau foto alat" class="size-full object-cover" />
                            <ImageIcon v-else class="size-6 text-gray-700" />
                        </span>
                        <span class="min-w-0">
                            <span class="block truncate text-sm text-gray-700">
                                {{ form.gambar ? 'Klik untuk mengganti foto' : 'Klik untuk mengunggah foto' }}
                            </span>
                            <span class="block text-xs text-gray-500">PNG, JPG (maks. 5 MB)</span>
                        </span>
                    </label>
                    <input
                        id="gambar"
                        class="sr-only"
                        type="file"
                        accept="image/png,image/jpeg"
                        @change="pilihFoto"
                    />
                </div>

                <div>
                    <label for="deskripsi" class="mb-2 block text-sm font-medium text-gray-800">
                        Deskripsi (Opsional)
                    </label>
                    <Textarea
                        id="deskripsi"
                        v-model="form.deskripsi"
                        class="min-h-32 resize-y"
                        maxlength="2000"
                    />
                </div>

                <div>
                    <label for="status_aktif" class="mb-2 block text-sm font-medium text-gray-800">
                        Status <span class="text-red-600">*</span>
                    </label>
                    <div class="flex min-h-10 items-center gap-3">
                        <Switch id="status_aktif" v-model="form.status_aktif" />
                        <span class="text-sm text-gray-700">
                            {{ form.status_aktif ? 'Tersedia' : 'Tidak tersedia' }}
                        </span>
                    </div>
                </div>
            </div>

            <p v-if="errorMessage" role="alert" class="mt-4 text-sm text-red-600">
                {{ errorMessage }}
            </p>

            <div class="mt-6 flex justify-end border-t pt-4">
                <Button type="submit" :disabled="loading || (!isEditMode && !form.reservation_token)">
                    <Save :size="18" />
                    {{ loading ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Alat' }}
                </Button>
            </div>
        </form>
    </div>
</template>
