<script setup lang="ts">
import { ref, computed } from 'vue'

const props = withDefaults(
  defineProps<{
    size?: number
    maxDistance?: number
    pupilColor?: string
    forceLookX?: number
    forceLookY?: number
    mouseX?: number
    mouseY?: number
  }>(),
  {
    size: 12,
    maxDistance: 5,
    pupilColor: '#2D2D2D',
    mouseX: 0,
    mouseY: 0,
  },
)

const socketRef = ref<HTMLDivElement | null>(null)

const pupilOffset = computed(() => {
  if (!socketRef.value) return { x: 0, y: 0 }
  if (props.forceLookX !== undefined && props.forceLookY !== undefined) {
    return { x: props.forceLookX, y: props.forceLookY }
  }
  const rect = socketRef.value.getBoundingClientRect()
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
    ref="socketRef"
    class="relative flex items-center justify-center"
    :style="{ width: `${size * 2}px`, height: `${size * 2}px` }"
  >
    <div
      class="rounded-full"
      :style="{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`,
      }"
    />
  </div>
</template>
