<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    size?: number
    pupilSize?: number
    maxDistance?: number
    eyeColor?: string
    pupilColor?: string
    isBlinking?: boolean
    forceLookX?: number
    forceLookY?: number
    mouseX?: number
    mouseY?: number
  }>(),
  {
    size: 48,
    pupilSize: 16,
    maxDistance: 10,
    eyeColor: 'white',
    pupilColor: '#2D2D2D',
    isBlinking: false,
    mouseX: 0,
    mouseY: 0,
  },
)

const eyeRef = ref<HTMLDivElement | null>(null)

const pupilOffset = computed(() => {
  if (!eyeRef.value || props.isBlinking) return { x: 0, y: 0 }
  if (props.forceLookX !== undefined && props.forceLookY !== undefined) {
    return { x: props.forceLookX, y: props.forceLookY }
  }
  const rect = eyeRef.value.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const deltaX = props.mouseX - cx
  const deltaY = props.mouseY - cy
  const distance = Math.min(Math.hypot(deltaX, deltaY), props.maxDistance)
  const angle = Math.atan2(deltaY, deltaX)
  return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance }
})
</script>

<template>
  <div
    ref="eyeRef"
    class="rounded-full flex items-center justify-center overflow-hidden"
    :class="isBlinking ? 'transition-all duration-150' : ''"
    :style="{
      width: `${size}px`,
      height: isBlinking ? '2px' : `${size}px`,
      backgroundColor: eyeColor,
    }"
  >
    <div
      v-if="!isBlinking"
      class="rounded-full"
      :style="{
        width: `${pupilSize}px`,
        height: `${pupilSize}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
      }"
    />
  </div>
</template>
