<script setup lang="ts">
import { ref } from 'vue'
import CSSHighlight from './components/css-highlight.vue'
const text = ref(
  'Setting the start point below (lower in the document) the end point will result in a collapsed range with the start and end points both set to the specified start position.'
)
const startIndex = ref(10)
const endIndex = ref(120)
</script>

<template>
  <CSSHighlight :text="text" :start-index="startIndex" :end-index="endIndex" />
</template>

<style scoped></style>
