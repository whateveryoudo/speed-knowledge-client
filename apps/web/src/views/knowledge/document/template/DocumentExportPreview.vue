<template>
  <div ref="rootRef" class="document-export-preview">
    <KnowledgeEditor
      :json="json"
      :title="title"
      :editable="false"
      :menubar="false"
      :header-style="headerStyle"
      :main-style="mainStyle"
      hide-border
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { KnowledgeEditor } from '@speed-tiptap-editor/knowledge-editor'
import '@speed-tiptap-editor/knowledge-editor/style.css'
import type { CSSProperties } from 'vue'

const props = withDefaults(
  defineProps<{
    json: string | null | Record<string, unknown>
    title?: string
    /** 导出内容区宽度（约 A4 可用宽） */
    contentWidth?: number
  }>(),
  {
    title: '',
    contentWidth: 794,
  },
)

const rootRef = ref<HTMLElement | null>(null)

const headerStyle = computed<CSSProperties>(() => ({
  display: 'none',
}))

const mainStyle = computed<CSSProperties>(() => ({
  width: `${props.contentWidth}px`,
  maxWidth: `${props.contentWidth}px`,
  margin: '0 auto',
  padding: '24px 32px',
  background: '#fff',
  boxSizing: 'border-box',
}))

defineExpose({
  rootRef,
})
</script>

<style scoped lang="less">
.document-export-preview {
  width: 100%;
  background: #fff;
  color: #1f1f1f;
}
</style>
