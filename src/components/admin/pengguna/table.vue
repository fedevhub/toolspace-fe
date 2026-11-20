<script setup>
import {
    ChevronLeft,
    ChevronRight,
    Pencil,
    Trash2,
    Users,
} from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'

defineProps({
    pengguna: {
        type: Array,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: false,
    },
    halamanSaatIni: {
        type: Number,
        default: 1,
    },
    totalHalaman: {
        type: Number,
        default: 1,
    },
    infoRentang: {
        type: Object,
        default: () => ({ mulai: 0, akhir: 0, total: 0 }),
    },
})

const emit = defineEmits(['edit', 'delete', 'ganti-halaman'])

function roleBadgeClass(role) {
    const map = {
        admin: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
        petugas: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20',
        peminjam: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
    }
    return map[String(role ?? '').toLowerCase()] ?? 'bg-gray-100 text-gray-700'
}

function formatRole(role) {
    if (!role) return '-'
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
}
</script>

<template>
    <section class="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
        <div class="overflow-x-auto">
            <table class="w-full min-w-[850px] border-collapse text-left text-sm">
                <thead>
                    <tr class="border-b border-gray-200 bg-black text-xs font-semibold tracking-wider text-white">
                        <th class="px-6 py-4">ID</th>
                        <th class="px-6 py-4">Nama Lengkap</th>
                        <th class="px-6 py-4">Username</th>
                        <th class="px-6 py-4">Email</th>
                        <th class="px-6 py-4">Role</th>
                        <th class="px-6 py-4 text-center">Aksi</th>
                    </tr>
                </thead>

                <tbody class="divide-y divide-gray-100">
                    <!-- Loading Skeleton -->
                    <template v-if="loading && pengguna.length === 0">
                        <tr v-for="n in 5" :key="n" class="animate-pulse">
                            <td class="px-6 py-4">
                                <div class="h-4 w-14 rounded bg-gray-100" />
                            </td>
                            <td class="px-6 py-4">
                                <div class="h-4 w-36 rounded bg-gray-100" />
                            </td>
                            <td class="px-6 py-4">
                                <div class="h-4 w-24 rounded bg-gray-100" />
                            </td>
                            <td class="px-6 py-4">
                                <div class="h-4 w-44 rounded bg-gray-100" />
                            </td>
                            <td class="px-6 py-4">
                                <div class="h-6 w-20 rounded-full bg-gray-100" />
                            </td>
                            <td class="px-6 py-4">
                                <div class="mx-auto h-8 w-20 rounded-lg bg-gray-100" />
                            </td>
                        </tr>
                    </template>

                    <!-- Empty State -->
                    <tr v-else-if="pengguna.length === 0">
                        <td colspan="6" class="px-6 py-16 text-center">
                            <div class="flex flex-col items-center justify-center">
                                <Users :size="44" stroke-width="1.25" class="text-gray-400" />
                                <p class="mt-3 text-base font-semibold text-gray-900">
                                    Tidak ada data pengguna
                                </p>
                                <p class="mt-1 text-sm text-gray-500">
                                    Belum ada pengguna terdaftar atau hasil pencarian tidak ditemukan.
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Data Rows -->
                    <tr v-for="item in pengguna" v-else :key="item.id" class="transition-colors hover:bg-gray-50/80">
                        <td class="px-6 py-4 font-mono text-xs font-medium text-gray-500">
                            {{ item.id_pengguna ?? item.id }}
                        </td>
                        <td class="px-6 py-4 font-semibold text-gray-900">
                            {{ item.nama_lengkap }}
                        </td>
                        <td class="px-6 py-4 text-gray-600">
                            {{ item.username }}
                        </td>
                        <td class="px-6 py-4 text-gray-600">
                            {{ item.email }}
                        </td>
                        <td class="px-6 py-4">
                            <span
                                class="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap"
                                :class="roleBadgeClass(item.role)">
                                {{ formatRole(item.role) }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex items-center justify-center gap-2">
                                <Button type="button" size="icon" variant="outline" title="Edit pengguna"
                                    class="size-8 rounded-lg border-[#dfe3e8] bg-blue-50/60 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                                    @click="emit('edit', item)">
                                    <Pencil :size="14" />
                                </Button>

                                <Button type="button" size="icon" variant="outline" title="Hapus pengguna"
                                    class="size-8 rounded-lg border-[#dfe3e8] bg-red-50/60 text-red-600 hover:bg-red-100 hover:text-red-700"
                                    @click="emit('delete', item.id)">
                                    <Trash2 :size="14" />
                                </Button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Pagination Footer -->
        <div v-if="!loading && infoRentang.total > 0"
            class="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-white px-6 py-4 sm:flex-row">
            <p class="text-xs text-gray-500">
                Menampilkan
                <span class="font-semibold text-gray-900">{{ infoRentang.mulai }}</span>
                –
                <span class="font-semibold text-gray-900">{{ infoRentang.akhir }}</span>
                dari
                <span class="font-semibold text-gray-900">{{ infoRentang.total }}</span>
                pengguna
            </p>

            <div class="flex items-center gap-1.5">
                <Button type="button" variant="outline" size="sm"
                    class="h-8 rounded-lg border-[#dfe3e8] px-2.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
                    :disabled="halamanSaatIni <= 1" @click="emit('ganti-halaman', halamanSaatIni - 1)">
                    <ChevronLeft :size="15" class="mr-0.5" />
                    Sebelumnya
                </Button>

                <button v-for="nomor in totalHalaman" :key="nomor" type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors"
                    :class="halamanSaatIni === nomor
                            ? 'bg-black text-white'
                            : 'border border-[#dfe3e8] bg-white text-gray-700 hover:bg-gray-50'
                        " @click="emit('ganti-halaman', nomor)">
                    {{ nomor }}
                </button>

                <Button type="button" variant="outline" size="sm"
                    class="h-8 rounded-lg border-[#dfe3e8] px-2.5 text-xs font-semibold text-gray-700 disabled:opacity-40"
                    :disabled="halamanSaatIni >= totalHalaman" @click="emit('ganti-halaman', halamanSaatIni + 1)">
                    Berikutnya
                    <ChevronRight :size="15" class="ml-0.5" />
                </Button>
            </div>
        </div>
    </section>
</template>