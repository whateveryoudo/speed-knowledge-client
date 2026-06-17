import type { KnowledgeItem, KnowledgeCommonPinItem } from '@sk/types';
import { createInjectionState } from '@vueuse/core';
import { to } from 'await-to-js';
import { ref, type Ref } from 'vue';
import { knowledge as knowledgeApi } from '@sk/api'
import { useToggle } from '@vueuse/core'

/**
 * 知识库全局上下文：常用 pin + 变更操作
 * 分页列表由 knowledgeMain 各列表页面内 useTable 负责
 */
export interface KnowledgeListContext {
  commonPinList: Ref<KnowledgeCommonPinItem[]>;
  commonPinLoading: Ref<boolean>;
  deleteLoading: Ref<boolean>;
  renameLoading: Ref<boolean>;

  initCommonPinList: () => Promise<void>;
  handleRename: (
    id: string,
    name: string,
    book?: KnowledgeItem,
    cb?: () => void,
  ) => Promise<void>;
  handleAddUsual: (knowledgeId: string) => Promise<void>;
  handleRemoveUsual: (knowledgeId: string) => Promise<void>;
  handleDelete: (slug: string, cb?: () => void) => Promise<void>;
  handleDragEnd: (evt: { oldIndex: number, newIndex: number }) => Promise<void>;
  isPinned: (knowledgeId: string) => boolean;
}

function initKnowledgeListState(): KnowledgeListContext {
  const commonPinList = ref<KnowledgeCommonPinItem[]>([]);
  const [commonPinLoading, toggleCommonPinLoading] = useToggle(false);
  const [deleteLoading, toggleDeleteLoading] = useToggle(false);
  const [renameLoading, toggleRenameLoading] = useToggle(false);

  const initCommonPinList = async () => {
    toggleCommonPinLoading(true);
    const [error, res] = await to(knowledgeApi.getCommonPinList())
    if (!error) {
      commonPinList.value = res.data
    }
    toggleCommonPinLoading(false);
  }

  const isPinned = (knowledgeId: string) =>
    commonPinList.value.some((item) => item.knowledge_id === knowledgeId)

  const syncKnowledgeName = (id: string, name: string) => {
    commonPinList.value = commonPinList.value.map((item) =>
      item.knowledge_id === id
        ? {
            ...item,
            knowledge: {
              ...item.knowledge,
              name,
            },
          }
        : item,
    )
  }

  const handleRename = async (
    id: string,
    name: string,
    book?: KnowledgeItem,
    cb?: () => void,
  ) => {
    const target =
      book ??
      commonPinList.value.find((item) => item.knowledge_id === id)?.knowledge
    if (!target) {
      return
    }
    toggleRenameLoading(true)
    const [error, res] = await to(
      knowledgeApi.updateKnowledge({
        ...target,
        name,
      }),
    )
    toggleRenameLoading(false)
    if (!error) {
      syncKnowledgeName(id, res.data.name)
      cb?.()
    }
  }

  const handleAddUsual = async (knowledgeId: string) => {
    if (isPinned(knowledgeId)) {
      return
    }
    const [error, res] = await to(knowledgeApi.createCommonPin(knowledgeId))
    if (!error && res.data) {
      commonPinList.value = [...commonPinList.value, res.data]
    }
  }

  const handleRemoveUsual = async (knowledgeId: string) => {
    const [error] = await to(knowledgeApi.deleteCommonPin(knowledgeId))
    if (!error) {
      commonPinList.value = commonPinList.value.filter(
        (item) => item.knowledge_id !== knowledgeId,
      )
    }
  }

  const handleDelete = async (slug: string, cb?: () => void) => {
    toggleDeleteLoading(true)
    const [error] = await to(knowledgeApi.deleteKnowledge(slug))
    toggleDeleteLoading(false)
    if (!error) {
      commonPinList.value = commonPinList.value.filter(
        (item) => item.knowledge.slug !== slug,
      )
      cb?.()
    }
  }

  const handleDragEnd = async (evt: { oldIndex: number, newIndex: number }) => {
    const { oldIndex, newIndex } = evt
    if (oldIndex === newIndex) {
      return
    }
    const moved = commonPinList.value[oldIndex]
    if (!moved) {
      return
    }
    commonPinList.value.splice(oldIndex, 1)
    commonPinList.value.splice(newIndex, 0, moved)
    const [error] = await to(
      knowledgeApi.updateCommonPinOrder(moved.knowledge_id, newIndex),
    )
    if (error) {
      await initCommonPinList()
    }
  }

  return {
    commonPinLoading,
    deleteLoading,
    renameLoading,
    commonPinList,
    initCommonPinList,
    handleRename,
    handleAddUsual,
    handleRemoveUsual,
    handleDelete,
    handleDragEnd,
    isPinned,
  };
}

const [useKnowledgeListProvider, useKnowledgeListOriginal] = createInjectionState(initKnowledgeListState);

export const useKnowledgeList = (): KnowledgeListContext => {
  const context = useKnowledgeListOriginal();
  if (!context) {
    throw new Error('useKnowledgeList must be used within KnowledgeListProvider');
  }
  return context;
};

export { useKnowledgeListProvider };
