<script setup>
    import LoginForm from '@/components/auth/login-form.vue';
</script>

<template>
    <div class="grid min-h-svh lg:grid-cols-2">
        <div class="relative hidden lg:block">
            <div class="relative h-full w-full overflow-hidden">
                <img
                    src="/src/assets/images/login.png"
                    alt="Image"
                    class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
                <div class="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent"></div>
            </div>
        </div>

        <div class="flex flex-col gap-4 p-6 md:p-10">
            <div class="flex flex-1 items-center justify-center">
                <div class="w-full max-w-md">
                    <LoginForm />
                </div>
            </div>
        </div>
    </div>
</template>