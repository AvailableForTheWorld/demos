<template>
  <div class="highlight-wrapper">
    <canvas ref="canvasRef" class="highlight-canvas"></canvas>
    <div ref="textContainer" class="text-container" v-html="domString"></div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'

const props = defineProps<{
  domString: string
  startIndex: number
  endIndex: number
}>()

function getNodeAndOffset(wrap_dom, start = 0, end = 0) {
  const txtList = []
  const map = function (children) {
    ;[...children].forEach((el) => {
      if (el.nodeName === '#text') {
        txtList.push(el)
      } else {
        map(el.childNodes)
      }
    })
  }
  // 递归遍历，提取出所有 #text
  map(wrap_dom.childNodes)
  // 计算文本的位置区间 [0,3]、[3, 8]、[8,10]
  const clips = txtList.reduce((arr, item, index) => {
    const end =
      item.textContent.length + (arr[index - 1] ? arr[index - 1][2] : 0)
    arr.push([item, end - item.textContent.length, end])
    return arr
  }, [])
  // 查找满足条件的范围区间
  const startNode = clips.find((el) => start >= el[1] && start < el[2]) || []
  const endNode = clips.find((el) => end >= el[1] && end <= el[2]) || []
  return [startNode[0], start - startNode[1], endNode[0], end - endNode[1]]
}

const textContainer = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const getHighlightColor = () => {
  const tempEl = document.createElement('div')
  tempEl.className = 'sentence-highlight'
  tempEl.style.position = 'absolute'
  tempEl.style.visibility = 'hidden'
  document.body.appendChild(tempEl)

  const computedStyle = window.getComputedStyle(tempEl)
  const bgColor = computedStyle.backgroundColor
  console.log(
    '%c [ bgColor ]-56',
    'font-size:13px; background:pink; color:#bf2c9f;',
    bgColor
  )

  document.body.removeChild(tempEl)

  return bgColor || '#ded9ff'
}

const getRange = () => {
  const [startNode, startOffset, endNode, endOffset] = getNodeAndOffset(
    textContainer.value,
    props.startIndex,
    props.endIndex
  )

  const range = new Range()
  range.setStart(startNode, startOffset)
  range.setEnd(endNode, endOffset)

  return range
}

const applyHighlightWithAPI = () => {
  if (!textContainer.value || !CSS.highlights) {
    return false
  }

  CSS.highlights.clear()

  const range = getRange()
  const highlight = new Highlight(range)
  CSS.highlights.set('text-highlight', highlight)

  return true
}

const applyHighlightWithCanvas = () => {
  if (!textContainer.value || !canvasRef.value) {
    return
  }

  const range = getRange()

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
  ctx.fillStyle = getHighlightColor()

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
<style>
/* Use global style to inherit from .sentence-highlight */
.highlight-wrapper ::highlight(text-highlight) {
  background-color: var(--sentence-highlight-bg, #ded9ff);
  color: var(--sentence-highlight-color, black);
}
</style>

<style scoped>
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
