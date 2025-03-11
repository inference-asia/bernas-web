<script setup>
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import { computed, onMounted } from 'vue'
import { useAPI } from "@/composables/useAPI"
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const api = useAPI()

const { user } = useAuth()

const layout = computed(() => {
  return route.meta.layout
})
</script>

<template>
   <component :is="layout">
    <RouterView />
  </component>
</template>