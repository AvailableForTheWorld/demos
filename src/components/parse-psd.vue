<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { readPsd, Layer } from '../utils'
import PsdFile from '../assets/psd/视觉1.psd'

const judgeIsPosTypeRight = (
	layer: Layer,
): layer is Layer & { left: number; right: number; top: number; bottom: number } => {
	const { left, right, top, bottom } = layer
	return left !== undefined && right !== undefined && top !== undefined && bottom !== undefined
}

function drawLayer(layer: Layer, context: CanvasRenderingContext2D) {
	if (layer.children && !layer.hidden) {
		layer.children.forEach((child) => drawLayer(child, context))
	}
	const compoundCanvas = document.createElement('canvas')
	const compoundCtx = compoundCanvas.getContext('2d') as CanvasRenderingContext2D
	if (layer.canvas && !layer.hidden && judgeIsPosTypeRight(layer)) {
		compoundCanvas.width = layer.right - layer.left
		compoundCanvas.height = layer.bottom - layer.top
		compoundCtx.globalAlpha = layer.opacity || 1
		compoundCtx.drawImage(layer.canvas, 0, 0)
		if (layer.mask && !layer.hidden && judgeIsPosTypeRight(layer.mask)) {
			// const offsetX = (layer.canvas.width - layer.mask.canvas.width) / 2
			// const offsetY = (layer.canvas.height - layer.mask.canvas.height) / 2
			const maskX = layer.mask.left - layer.left
			const maskY = layer.mask.top - layer.top
			compoundCtx.globalCompositeOperation = 'destination-in'
			const maskCanvas = layer.mask.canvas as HTMLCanvasElement
			compoundCtx.drawImage(maskCanvas, maskX, maskY)
		}
		// compoundCtx.globalCompositeOperation = 'source-over'
		compoundCtx.globalAlpha = 1
		context.drawImage(compoundCanvas, layer.left, layer.top)
	}
}

onMounted(async () => {
	const response = await fetch(PsdFile)
	const arrayBuffer = await response.arrayBuffer()
	const psd = await readPsd(arrayBuffer)
	console.log('psd: ', psd)
	// Try to find an existing canvas
	let canvas = document.querySelector('canvas')

	// If there's no existing canvas, create a new one
	if (!canvas) {
		canvas = document.createElement('canvas')
		document.body.appendChild(canvas) // Append only if it's a new canvas
	}
	canvas.width = psd.width
	canvas.height = psd.height
	const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	psd.children &&
		psd.children.forEach((layer) => {
			drawLayer(layer, ctx)
		})
	// ctx?.drawImage(psd.canvas, 0, 0)
	document.body.appendChild(canvas)
	// const link = document.createElement('a')
	// link.href = canvas.toDataURL('image/png')
	// link.download = 'psd.png'
	// link.click()
})
</script>

<template>
	<div id="canvas-container"></div>
</template>

<style scoped></style>
