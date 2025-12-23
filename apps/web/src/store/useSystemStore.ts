import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSystemStore = defineStore('system', () => {
  // 知识库左侧宽度
  const knowledgeSidebarWidth = ref<number>(
    Number(localStorage.getItem('sk_knowledge_expand_width')) || 253,
  )

  // 知识库侧边栏是否展开
  const knowledgeSidebarOpen = ref<boolean>(
    !localStorage.getItem('sk_knowledge_expand') ||
      localStorage.getItem('sk_knowledge_expand') === 'true',
  )

  // 设置知识库左侧宽度
  const setKnowledgeSidebarWidth = (width: number) => {
    // 限制宽度范围
    const clampedWidth = Math.max(200, Math.min(400, width))
    knowledgeSidebarWidth.value = clampedWidth
    localStorage.setItem('sk_knowledge_expand_width', clampedWidth.toString())
  }

  // 切换知识库侧边栏展开状态
  const toggleKnowledgeSidebar = () => {
    knowledgeSidebarOpen.value = !knowledgeSidebarOpen.value
    localStorage.setItem('sk_knowledge_expand', knowledgeSidebarOpen.value ? 'true' : 'false')
  }

  // 设置知识库侧边栏展开状态
  const setKnowledgeSidebarOpen = (open: boolean) => {
    knowledgeSidebarOpen.value = open
    localStorage.setItem('sk_knowledge_expand', open ? 'true' : 'false')
  }

  return {
    // 状态
    knowledgeSidebarWidth,
    knowledgeSidebarOpen,

    // 方法
    setKnowledgeSidebarWidth,
    toggleKnowledgeSidebar,
    setKnowledgeSidebarOpen,
  }
})
