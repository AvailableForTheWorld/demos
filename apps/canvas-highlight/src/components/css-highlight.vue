<template>
  <div class="highlight-wrapper">
    <canvas ref="canvasRef" class="highlight-canvas"></canvas>
    <div ref="textContainer" class="text-container">{{ text }}</div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'

const props = defineProps<{
  text: string
  startIndex: number
  endIndex: number
}>()

const textContainer = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const applyHighlightWithAPI = () => {
  if (!textContainer.value || !CSS.highlights) {
    return false
  }

  CSS.highlights.clear()

  const textNode = textContainer.value.firstChild
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
    return false
  }

  const range = new Range()
  range.setStart(textNode, props.startIndex)
  range.setEnd(textNode, props.endIndex)

  const highlight = new Highlight(range)
  CSS.highlights.set('text-highlight', highlight)

  return true
}

const applyHighlightWithCanvas = () => {
  if (!textContainer.value || !canvasRef.value) {
    return
  }

  const textNode = textContainer.value.firstChild
  if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
    return
  }

  const range = new Range()
  range.setStart(textNode, props.startIndex)
  range.setEnd(textNode, props.endIndex)

  const rects = range.getClientRects()
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')

  if (!ctx || rects.length === 0) {
    return
  }

  const containerRect = textContainer.value.getBoundingClientRect()

  canvas.width = containerRect.width
  canvas.height = containerRect.height

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = 'purple'

  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i]
    if (!rect) continue

    const x = rect.left - containerRect.left
    const y = rect.top - containerRect.top

    ctx.fillRect(x, y, rect.width, rect.height)
  }
}

const applyHighlight = async () => {
  await nextTick()
  if (CSS.highlights) {
    applyHighlightWithAPI()
  } else {
    applyHighlightWithCanvas()
  }
}

onMounted(() => {
  applyHighlight()
})

watch(
  () => [props.text, props.startIndex, props.endIndex],
  () => {
    applyHighlight()
  }
)
</script>
<style scoped>
::highlight(text-highlight) {
  background-color: purple;
  color: black;
}
.highlight-wrapper {
  position: relative;
  width: 300px;
}
.highlight-canvas {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  opacity: 0.5;
}
.text-container {
  position: relative;
  width: 100%;
}
</style>
