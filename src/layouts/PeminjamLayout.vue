<script setup>
import PeminjamSidebar from '@/components/layout/PeminjamSidebar.vue'
</script>

<template>
    <div class="h-screen overflow-hidden">
        <PeminjamSidebar />
        <main class="ml-58 h-screen overflow-y-auto bg-white">
            <RouterView />
        </main>
    </div>
</template>
