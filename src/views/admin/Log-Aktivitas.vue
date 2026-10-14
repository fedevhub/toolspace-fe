<script setup>
    import { ref } from 'vue'
    import Table from '@/components/admin/log-aktivitas.vue';
    import { Input } from '@/components/ui/input';
    import { Plus, Search, ChevronDown } from 'lucide-vue-next'
    import Calendar from '@/components/ui/calendar/Calendar.vue'
    import Button from '@/components/ui/button/Button.vue';
    import {
        Popover,
        PopoverContent,
        PopoverTrigger,
    } from '@/components/ui/popover'
    import { DateFormatter, getLocalTimeZone, today } from '@internationalized/date'
    import { CalendarIcon } from '@lucide/vue'
    import { cn } from '@/lib/utils'
    const date = ref()
    const defaultPlaceholder = today(getLocalTimeZone())
</script>

<template>
    <div class="p-8">
        <h1 class="text-3xl font-bold">Log-Aktivitas</h1>
        <p class="font-medium text-gray-500">Kelola data hak akses, peran, dan status keaktifan pengguna sistem.</p>
        <div class="flex w-full items-center py-5">
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

            <div class="ml-auto flex items-center gap-3">
                <Popover>
                    <PopoverTrigger as-child>
                    <Button
                        variant="outline"
                        :class="cn(
                        'w-[180px] justify-start text-left font-normal',
                        !date && 'text-muted-foreground',
                        )"
                    >
                        <CalendarIcon class="mr-2 h-4 w-4" />
                        {{ date ? date.toDateString() : "Pick a date" }}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-auto p-0">
                    <Calendar
                        v-model="date"
                        :initial-focus="true"
                        :default-placeholder="defaultPlaceholder"
                        layout="month-and-year"
                    />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
        <Table />
    </div>
</template>