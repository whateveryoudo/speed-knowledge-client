import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSystemStore = defineStore('system', () => {
  const unreadNotificationCount = ref<number>(0) // 未读通知数量
  // 知识库左侧宽度
  const knowledgeSidebarWidth = ref<number>(
    Number(localStorage.getItem('sk_knowledge_expand_width')) || 253,
  )

  // 知识库侧边栏是否展开
  const knowledgeSidebarOpen = ref<boolean>(
    !localStorage.getItem('sk_knowledge_expand') ||
      localStorage.getItem('sk_knowledge_expand') === 'true',
  )

  // 设置知识库左侧宽度(isDrag: 是否是拖拽触发)
  const setKnowledgeSidebarWidth = (width: number, isDrag = true) => {
    // 限制宽度范围
    const clampedWidth = isDrag ? Math.max(200, Math.min(400, width)) : width;
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
  const setUnreadNotificationCount = (count: number) => {
    unreadNotificationCount.value = count
  }

  return {
    // 状态
    knowledgeSidebarWidth,
    knowledgeSidebarOpen,
    unreadNotificationCount,

    // 方法
    setKnowledgeSidebarWidth,
    toggleKnowledgeSidebar,
    setKnowledgeSidebarOpen,
    setUnreadNotificationCount
  }
})
