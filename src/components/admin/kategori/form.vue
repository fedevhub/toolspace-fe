<script setup>
import { computed, ref, watch } from 'vue'
import { AlertCircle, Save, X } from 'lucide-vue-next'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Button from '@/components/ui/button/Button.vue'
import {
    editKategori,
    reserveKodeKategori,
    tambahKategori,
} from '@/services/kategoriService'

const props = defineProps({
    open: Boolean,
    kategori: {
        type: Object,
        default: null,
    },
})

const emit = defineEmits(['update:open', 'saved'])

const kategoriId = computed(() => props.kategori?.id)
const isEditMode = computed(() => Boolean(kategoriId.value))
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')

const form = ref({
    kode_kategori: '',
    reservation_token: '',
    nama_kategori: '',
    deskripsi: '',
})

async function ambilKodeBerikutnya() {
    const response = await reserveKodeKategori()
    form.value.kode_kategori = response.data.kode_kategori
    form.value.reservation_token = response.data.token
}

async function siapkanForm() {
    errorMessage.value = ''
    loading.value = true
    try {
        if (isEditMode.value) {
            form.value = {
                kode_kategori: props.kategori.kode_kategori ?? '',
                reservation_token: '',
                nama_kategori: props.kategori.nama_kategori ?? '',
                deskripsi: props.kategori.deskripsi ?? '',
            }
        } else {
            form.value = {
                kode_kategori: '',
                reservation_token: '',
                nama_kategori: '',
                deskripsi: '',
            }
            await ambilKodeBerikutnya()
        }
    } catch (error) {
        console.error('Gagal memuat form kategori:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal memuat data kategori.'
    } finally {
        loading.value = false
    }
}

watch(
    () => [props.open, props.kategori],
    ([open]) => {
        if (open) siapkanForm()
    },
    { immediate: true }
)

async function handleSubmit() {
    errorMessage.value = ''
    if (!form.value.nama_kategori.trim()) {
        errorMessage.value = 'Nama kategori wajib diisi.'
        return
    }

    if (!isEditMode.value && (!form.value.kode_kategori || !form.value.reservation_token)) {
        errorMessage.value = 'ID kategori belum berhasil dicadangkan. Muat ulang halaman untuk mencoba lagi.'
        return
    }

    saving.value = true
    const data = {
        nama_kategori: form.value.nama_kategori.trim(),
        deskripsi: form.value.deskripsi.trim(),
        ...(!isEditMode.value
            ? {
                kode_kategori: form.value.kode_kategori,
                reservation_token: form.value.reservation_token,
            }
            : {}),
    }

    try {
        if (isEditMode.value) {
            await editKategori(kategoriId.value, data)
        } else {
            await tambahKategori(data)
        }
        emit('update:open', false)
        emit('saved')
    } catch (error) {
        console.error('Gagal menyimpan kategori:', error)
        errorMessage.value = error.response?.data?.message ?? 'Gagal menyimpan kategori.'
    } finally {
        saving.value = false
    }
}
</script>

<template>
    <Dialog :open="open" @update:open="emit('update:open', $event)">
        <DialogContent
            class="w-[95vw] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-lg [&>button]:hidden"
        >
            <DialogHeader class="flex flex-row items-center justify-between border-b border-gray-100 px-6 py-5 sm:px-8">
                <DialogTitle class="font-display text-lg font-bold tracking-wide text-gray-900 sm:text-xl">
                    {{ isEditMode ? 'EDIT KATEGORI' : 'TAMBAH KATEGORI BARU' }}
                </DialogTitle>
                <DialogDescription class="sr-only">
                    {{ isEditMode ? 'Perbarui informasi kategori.' : 'Isi nama dan deskripsi untuk menambahkan kategori baru.' }}
                </DialogDescription>

                <button
                    type="button"
                    class="rounded-full p-1 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    aria-label="Tutup modal"
                    @click="emit('update:open', false)"
                >
                    <X :size="20" />
                </button>
            </DialogHeader>

            <form @submit.prevent="handleSubmit">
                <div v-if="loading" class="space-y-4 px-6 py-8 sm:px-8">
                    <div class="h-11 w-full animate-pulse rounded-xl bg-gray-100" />
                    <div class="h-11 w-full animate-pulse rounded-xl bg-gray-100" />
                    <div class="h-24 w-full animate-pulse rounded-xl bg-gray-100" />
                </div>

                <div v-else class="space-y-5 px-6 py-6 sm:px-8">
                    <!-- Kode Kategori (Readonly) -->
                    <div>
                        <label for="kode_kategori" class="mb-2 block text-sm font-semibold text-gray-800">
                            Kode Kategori
                        </label>
                        <Input
                            id="kode_kategori"
                            :model-value="form.kode_kategori || '-'"
                            readonly
                            disabled
                            class="h-11 rounded-xl border-[#dfe3e8] bg-gray-50 px-4 font-mono text-sm font-semibold text-gray-600"
                        />
                    </div>

                    <!-- Nama Kategori -->
                    <div>
                        <label for="nama_kategori" class="mb-2 block text-sm font-semibold text-gray-800">
                            Nama Kategori <span class="text-red-600">*</span>
                        </label>
                        <Input
                            id="nama_kategori"
                            v-model="form.nama_kategori"
                            placeholder="Masukkan nama kategori"
                            required
                            class="h-11 rounded-xl border-[#dfe3e8] bg-white px-4 text-sm shadow-xs focus-visible:border-black"
                        />
                    </div>

                    <!-- Deskripsi -->
                    <div>
                        <label for="deskripsi" class="mb-2 block text-sm font-semibold text-gray-800">
                            Deskripsi
                        </label>
                        <Textarea
                            id="deskripsi"
                            v-model="form.deskripsi"
                            rows="3"
                            placeholder="Masukkan deskripsi kategori (opsional)"
                            class="rounded-xl border-[#dfe3e8] bg-white px-4 py-3 text-sm shadow-xs focus-visible:border-black"
                        />
                    </div>

                    <!-- Error Alert -->
                    <div
                        v-if="errorMessage"
                        role="alert"
                        class="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700"
                    >
                        <AlertCircle :size="16" class="shrink-0" />
                        <span>{{ errorMessage }}</span>
                    </div>
                </div>

                <DialogFooter class="flex flex-col-reverse gap-2.5 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
                    <Button
                        type="button"
                        variant="outline"
                        class="h-10 rounded-xl border-[#dfe3e8] px-4 font-semibold text-gray-700"
                        @click="emit('update:open', false)"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        class="h-10 gap-2 rounded-xl bg-black px-5 font-semibold text-white hover:bg-black/85 disabled:opacity-40"
                        :disabled="loading || saving || (!isEditMode && !form.reservation_token)"
                    >
                        <Save :size="16" />
                        {{ saving ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Kategori' }}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>