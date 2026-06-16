import type { KnowledgeItem, KnowledgeCommonPinItem } from '@sk/types';
import { createInjectionState } from '@vueuse/core';
import { to } from 'await-to-js';
import { ref, type Ref } from 'vue';
import { knowledge as knowledgeApi } from '@sk/api'
import { useToggle } from '@vueuse/core'

/**
 * KnowledgeList 上下文接口
 */
export interface KnowledgeListContext {
  listLoading: Ref<boolean>;
  knowledgeList: Ref<KnowledgeItem[]>;
  commonPinList: Ref<KnowledgeCommonPinItem[]>;
  commonPinLoading: Ref<boolean>;
  deleteLoading: Ref<boolean>;
  renameLoading: Ref<boolean>;

  initKnowledgeList: () => Promise<void>;
  initCommonPinList: () => Promise<void>;
  handleRename: (id: string, name: string, cb?: () => void) => Promise<void>;
  handleAddUsual: (knowledgeId: string) => Promise<void>;
  handleRemoveUsual: (knowledgeId: string) => Promise<void>;
  handleDelete: (slug: string, cb: Function) => Promise<void>;
  handleDragEnd: (evt: { oldIndex: number, newIndex: number }) => Promise<void>;
}

/**
 * 初始化 KnowledgeList 状态
 */
function initKnowledgeListState(): KnowledgeListContext {
  const knowledgeList = ref<KnowledgeItem[]>([]);
  const commonPinList = ref<KnowledgeCommonPinItem[]>([]);
  const [listLoading, toggleListLoading] = useToggle(false);
  const [commonPinLoading, toggleCommonPinLoading] = useToggle(false);
  const [deleteLoading, toggleDeleteLoading] = useToggle(false);
  const [renameLoading, toggleRenameLoading] = useToggle(false);

  const initKnowledgeList = async () => {
    toggleListLoading(true);
    const [error, res] = await to(knowledgeApi.getKnowledgeList())
    if (!error) {
      knowledgeList.value = res.data
    }
    toggleListLoading(false);
  }

  const initCommonPinList = async () => {
    toggleCommonPinLoading(true);
    const [error, res] = await to(knowledgeApi.getCommonPinList())
    if (!error) {
      commonPinList.value = res.data
    }
    toggleCommonPinLoading(false);
  }

  const syncKnowledgeName = (id: string, name: string) => {
    const listIndex = knowledgeList.value.findIndex((item) => item.id === id)
    if (listIndex !== -1) {
      const item = knowledgeList.value[listIndex]
      if (item) {
        item.name = name
      }
    }
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

  const handleRename = async (id: string, name: string, cb?: () => void) => {
    const book =
      knowledgeList.value.find((item) => item.id === id) ??
      commonPinList.value.find((item) => item.knowledge_id === id)?.knowledge
    if (!book) {
      return
    }
    toggleRenameLoading(true)
    const [error, res] = await to(
      knowledgeApi.updateKnowledge({
        ...book,
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
    const [error] = await to(knowledgeApi.createCommonPin(knowledgeId))
    if (!error) {
      await initCommonPinList()
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

  const handleDelete = async (slug: string, cb: Function) => {
    toggleDeleteLoading(true)
    const [error] = await to(knowledgeApi.deleteKnowledge(slug))
    toggleDeleteLoading(false)
    if (!error) {
      const index = knowledgeList.value.findIndex((item: KnowledgeItem) => item.slug === slug)
      if (index !== -1) {
        knowledgeList.value.splice(index, 1)
      }
      commonPinList.value = commonPinList.value.filter(
        (item) => item.knowledge.slug !== slug,
      )
      cb && typeof cb === 'function' && cb();
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
    listLoading,
    commonPinLoading,
    deleteLoading,
    renameLoading,
    knowledgeList,
    commonPinList,
    initKnowledgeList,
    initCommonPinList,
    handleRename,
    handleAddUsual,
    handleRemoveUsual,
    handleDelete,
    handleDragEnd,
  };
}

const [useKnowledgeListProvider, useKnowledgeListOriginal] = createInjectionState(initKnowledgeListState);

/**
 * 包装 useKnowledgeList，确保总是返回非空（带类型守卫）
 */
export const useKnowledgeList = (): KnowledgeListContext => {
  const context = useKnowledgeListOriginal();
  if (!context) {
    throw new Error('useKnowledgeList must be used within KnowledgeListProvider');
  }
  return context;
};

export { useKnowledgeListProvider };
