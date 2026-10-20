<script setup>
    import Table from '@/components/admin/kategori/table.vue';
    import { Input } from '@/components/ui/input';
    import { Plus, Search } from 'lucide-vue-next';
    import Button from '@/components/ui/button/Button.vue';
    import { useRouter } from 'vue-router'
    import KategoriForm from '@/components/admin/kategori/form.vue'
    import { ref } from 'vue'

    const kategoriTerpilih = ref(null)
    const dialogOpen = ref(false)

    function kategoriForm() {
        kategoriTerpilih.value = null
        dialogOpen.value = true
    }
</script>

<template>
    <div class="p-8">
        <h1 class="text-3xl font-bold">Kelola Kategori</h1>
        <p class="font-medium text-gray-500">Kelola data kategori untuk mengelompokkan alat sesuai jenisnya.</p>
        <div class="flex w-full items-center py-5 ">
            <div class="relative w-75">
                <Search
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    :size="18"
                />

                <Input
                    type="text"
                    placeholder="Cari"
                    class="bg-white pl-10"
                />
            </div>

            <div class="ml-auto">
                <Button @click="kategoriForm">
                    <Plus :size="20" />
                    Tambah Kategori
                </Button>
            </div>
        </div>
        <Table />
        <KategoriForm
            v-model:open="dialogOpen"
            :kategori="kategoriTerpilih"
        />
    </div>
</template>