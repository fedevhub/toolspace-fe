<script setup>
import PetugasSidebar from '@/components/layout/PetugasSidebar.vue';
</script>

<template>
    <div class="h-screen overflow-hidden">
        <PetugasSidebar />

        <main class="ml-58 h-screen overflow-y-auto bg-[#f5f5f5]">
            <RouterView />
        </main>
    </div>
</template>
