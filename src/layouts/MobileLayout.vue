<script setup>
import {onMounted} from 'vue'
import {useAuth} from '../composables/useAuth'

const { setMobileUser } = useAuth()

onMounted(() => {
    setMobileUser()
})
</script>

<template>
    <slot/>
</template>