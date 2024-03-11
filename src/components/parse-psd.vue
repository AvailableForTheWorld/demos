<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { readPsd, Layer, LayerEffectGradientOverlay, EffectSolidGradient, ColorStop, RGBA, RGB } from '../utils'
import PsdFile from '../assets/psd/视觉1-copy.psd'

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
	if (!judgeIsPosTypeRight(layer)) {
		return
	}
	compoundCanvas.width = layer.right - layer.left
	compoundCanvas.height = layer.bottom - layer.top
	if (layer.text) {
		const { style, text, transform } = layer.text
		if (!style || !style.fontSize || !transform || !text) return
		const fontHeight = style.fontSize * transform[0]
		compoundCanvas.height = Math.max(fontHeight, compoundCanvas.height)
		compoundCtx.font = fontHeight + 'px ' + style.font?.name
		const fillColor = style.fillColor as RGB
		if (!fillColor) return
		compoundCtx.fillStyle = `rgb(${fillColor.r},${fillColor.g},${fillColor.b})`
		compoundCtx.textAlign = 'center'
		compoundCtx.textBaseline = 'middle'
		const x = compoundCanvas.width / 2 // X-coordinate for the text
		const y = compoundCanvas.height / 2 // Y-coordinate for the text
		compoundCtx.fillText(text, x, y)
		context.drawImage(compoundCanvas, layer.left, layer.top)
	} else if ((layer.canvas || layer.imageData) && !layer.hidden) {
		compoundCtx.globalAlpha = layer.opacity === undefined ? 1 : layer.opacity
		if (layer.canvas) {
			compoundCtx.drawImage(layer.canvas, 0, 0)
		} else {
			const data = layer.imageData.data
			const opacity = compoundCtx.globalAlpha
			if (opacity < 1) {
				for (let i = 3; i < data.length; i += 4) {
					data[i] = Math.round(data[i] * opacity)
				}
			}
			compoundCtx.putImageData(layer.imageData as ImageData, 0, 0)
		}
		if (layer.effects) {
			const { solidFill, gradientOverlay: originGradientOverlay } = layer.effects
			if (solidFill && Array.isArray(solidFill)) {
				const fill = solidFill[0] as { enabled: boolean; color: { r: number; g: number; b: number; a?: number } }
				if (fill.enabled) {
					compoundCtx.fillStyle = `rgba(${fill.color.r}, ${fill.color.g}, ${fill.color.b}, ${fill.color.a || 1})`
					compoundCtx.globalCompositeOperation = 'source-in'
					compoundCtx.fillRect(0, 0, compoundCanvas.width, compoundCanvas.height)
					compoundCtx.globalCompositeOperation = 'source-over'
				}
			}
			const gradientOverlay = originGradientOverlay?.find(
				(overlay) => overlay.enabled,
			) as LayerEffectGradientOverlay & { angle: number }
			if (gradientOverlay) {
				// Create the gradient
				let gradient: CanvasGradient
				const angle = (gradientOverlay?.angle || 0) * (Math.PI / 180) // Convert degrees to radians
				const x0 = compoundCanvas.width / 2 + Math.cos(angle + Math.PI) * compoundCanvas.width
				const y0 = compoundCanvas.height / 2 + Math.sin(angle + Math.PI) * compoundCanvas.height
				const x1 = compoundCanvas.width / 2 + Math.cos(angle) * compoundCanvas.width
				const y1 = compoundCanvas.height / 2 + Math.sin(angle) * compoundCanvas.height

				gradient = compoundCtx.createLinearGradient(x0, y0, x1, y1)

				const curGradient = gradientOverlay.gradient as EffectSolidGradient
				// Add color stops
				curGradient.colorStops.forEach((colorStop: ColorStop) => {
					const color = colorStop.color as RGBA
					gradient.addColorStop(colorStop.location, `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a || 1})`)
				})
				compoundCtx.globalCompositeOperation = 'source-in'
				// Apply the gradient
				compoundCtx.fillStyle = gradient
				compoundCtx.fillRect(0, 0, compoundCanvas.width, compoundCanvas.height)
				compoundCtx.globalCompositeOperation = 'source-over'
			}
		}
		if (layer.mask && !layer.hidden && judgeIsPosTypeRight(layer.mask) && (layer.mask.canvas || layer.mask.imageData)) {
			// Prepare mask
			const maskCanvas = document.createElement('canvas')
			const maskCtx = maskCanvas.getContext('2d') as CanvasRenderingContext2D
			maskCanvas.width = layer.mask.right - layer.mask.left
			maskCanvas.height = layer.mask.bottom - layer.mask.top

			// Draw mask
			if (layer.mask.canvas) {
				maskCtx.drawImage(layer.mask.canvas, 0, 0)
			} else {
				maskCtx.putImageData(layer.mask.imageData as ImageData, 0, 0)
			}

			// Convert grayscale to alpha
			const maskImageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height)
			const data = maskImageData.data
			for (let i = 0; i < data.length; i += 4) {
				// Assuming the mask is grayscale, the R, G, and B values should be approximately equal.
				// The alpha value of each pixel is set based on the average of the RGB values.
				const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
				data[i + 3] = avg // Set alpha channel to the average of R, G, and B
			}
			maskCtx.putImageData(maskImageData, 0, 0)

			// Apply mask
			const maskX = layer.mask.left - layer.left
			const maskY = layer.mask.top - layer.top
			compoundCtx.globalCompositeOperation = 'destination-in'
			compoundCtx.drawImage(maskCanvas, maskX, maskY)
		}
		// compoundCtx.globalCompositeOperation = 'source-over'
		// compoundCtx.globalAlpha = 1
		context.drawImage(compoundCanvas, layer.left, layer.top)
	}
}

onMounted(async () => {
	const response = await fetch(PsdFile)
	const arrayBuffer = await response.arrayBuffer()
	const psd = await readPsd(arrayBuffer, { useImageData: true })
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
