<template>
  <div
    class="team-avatar-wrapper inline-flex items-center justify-center shrink-0 overflow-hidden"
    :style="wrapperStyle"
  >
    <!-- 自定义上传图片 -->
    <img
      v-if="isCustomAvatar"
      :src="icon"
      class="w-full h-full object-cover"
      alt="team avatar"
    />
    <!-- 预设内置图标 -->
    <s-icon-font
      v-else
      :type="icon || 'icon-book-10'"
      svg-sprite
      :style="{ width: `${innerSize}px`, height: `${innerSize}px` }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    icon?: string | null
    size?: number
    rounded?: string
  }>(),
  {
    icon: 'icon-book-10',
    size: 32,
    rounded: '6px',
  },
)

const isCustomAvatar = computed(() => {
  if (!props.icon) return false
  return (
    props.icon.startsWith('http://') ||
    props.icon.startsWith('https://') ||
    props.icon.startsWith('/') ||
    props.icon.startsWith('data:image/') ||
    props.icon.startsWith('blob:')
  )
})

const innerSize = computed(() => Math.round(props.size * 0.75))

const wrapperStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  borderRadius: props.rounded,
}))
</script>
