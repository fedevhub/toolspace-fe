<script setup>
import PetugasSidebar from '@/components/layout/PetugasSidebar.vue'
</script>

<template>
    <div class="h-screen overflow-hidden">
        <PetugasSidebar />

        <main class="ml-58 h-screen overflow-y-auto bg-[#F5F5F5]" style="font-family: 'DM Sans', Arial, sans-serif">
            <RouterView />
        </main>
    </div>
</template>
