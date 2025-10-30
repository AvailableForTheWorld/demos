<script setup lang="ts">
import { ref } from 'vue'
import CSSHighlight from './components/css-highlight.vue'
import { marked } from 'marked'

const markdownString = `**卡皮巴拉**天性喜欢水，不仅游泳技术一流，\`还经常在水中度过炎热的午后。它们的一双小眼睛和鼻孔位于头部上方，便于在水中露出一点观察周围环境。\`这些可爱的动物几乎与所有生物都能和睦相处：
    - 乌龟会爬上它的背晒太阳
    - 小鸟在它身旁觅食
    - 就连掠食者也不常对它发起攻击
    因为它们的淡定和友好让人无法产生敌意。`

const domString = marked(markdownString)
console.log(
  '%c [ domString ]-13',
  'font-size:13px; background:pink; color:#bf2c9f;',
  domString
)

const text = ref(
  'Setting the start point below (lower in the document) the end point will result in a collapsed range with the start and end points both set to the specified start position.'
)
const startIndex = ref(10)
const endIndex = ref(30)
</script>

<template>
  <CSSHighlight
    :dom-string="domString"
    :start-index="startIndex"
    :end-index="endIndex"
  />
</template>

<style scoped></style>
