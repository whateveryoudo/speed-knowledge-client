<template>
  <div
    class="menu-item-base group justify-between flex items-center gap-2.5 h-[40px]! px-2 cursor-pointer hover:bg-[var(--sd-bg-primary-hover)] transition-[background-color] duration-200"
    @click="emit('select')">
    <div class="flex-1 min-w-0 flex items-center gap-2.5">
      <IconFont :type="iconType" svg-sprite class="shrink-0 w-5 h-5" />
      <div class="truncate text-[var(--sd-text-caption)]">
        <template v-if="keyword && highlightName">
          <span>{{ nameBefore }}</span>
          <span class="font-semibold text-[var(--sd-text-primary)]">{{ keyword }}</span>
          <span>{{ nameAfter }}</span>
        </template>
        <template v-else>{{ title }}</template>
      </div>

    </div>
    <div v-if="subtitle" class="truncate text-[var(--sd-text-caption)] group-hover:opacity-100 opacity-0">
      {{ subtitle }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IconFont } from 'speed-components-ui/components'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    iconType?: string
    keyword?: string
    showLock?: boolean
    highlightName?: boolean
  }>(),
  {
    iconType: 'icon-document',
    keyword: '',
    showLock: false,
    highlightName: true,
  },
)

const emit = defineEmits<{
  (e: 'select'): void
}>()

const matchIndex = computed(() => {
  const q = props.keyword.trim().toLowerCase()
  if (!q || !props.highlightName) return -1
  return props.title.toLowerCase().indexOf(q)
})

const nameBefore = computed(() =>
  matchIndex.value >= 0 ? props.title.slice(0, matchIndex.value) : props.title,
)
const nameAfter = computed(() =>
  matchIndex.value >= 0
    ? props.title.slice(matchIndex.value + props.keyword.trim().length)
    : '',
)
</script>
