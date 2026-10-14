<script setup>
    import Table from '@/components/admin/alat/table.vue';
    import { Input } from '@/components/ui/input';
    import { Plus, Search } from 'lucide-vue-next';
    import Button from '@/components/ui/button/Button.vue';
    import { useRouter } from 'vue-router'
    
    const router = useRouter()
</script>

<template>
    <div class="p-8">
        <h1 class="text-3xl font-bold">Kelola Alat</h1>
        <p class="font-medium text-gray-500">Kelola data hak akses, peran, dan status keaktifan pengguna sistem.</p>
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
                <Button @click="router.push('/admin/alat-form')">
                    <Plus :size="20" /> Tambah Alat
                </Button>
            </div>
        </div>
        <Table />
    </div>
</template>