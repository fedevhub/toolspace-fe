<script setup>
    import ChartBar from '@/components/admin/chart-bar.vue';
    import SectionCards from '@/components/admin/section-cards.vue';
</script>

<template>
    <div class="p-8">
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <p class="font-medium text-gray-500">Pantau ringkasan data dan aktivitas sistem secara keseluruhan.</p>
        <SectionCards />
        <ChartBar />
    </div>
</template>