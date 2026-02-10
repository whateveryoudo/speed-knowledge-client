import type { KnowledgeItem } from '@sk/types';
import { createInjectionState } from '@vueuse/core';
import { to } from 'await-to-js';
import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { knowledge as knowledgeApi } from '@sk/api'
import { useToggle } from '@vueuse/core'
/**
 * KnowledgeList 上下文接口
 */
export interface KnowledgeListContext {
  listLoading: Ref<boolean>;
  knowledgeList: Ref<KnowledgeItem[]>;
  deleteLoading: Ref<boolean>;

  // 方法
  initKnowledgeList: () => Promise<void>;
  handleRename: (id: string, name: string) => Promise<void>;
  handleRemoveUsual: (id: string) => Promise<void>;
  handleDelete: (slug: string, cb: Function) => Promise<void>;
  handleDragEnd: (evt: { oldIndex: number, newIndex: number }) => Promise<void>;
}

/**
 * 初始化 KnowledgeList 状态
 */
function initKnowledgeListState(): KnowledgeListContext {
  const knowledgeList = ref<KnowledgeItem[]>([]);
  const [listLoading, toggleListLoading] = useToggle(false);
  const [deleteLoading, toggleDeleteLoading] = useToggle(false);
  // 初始化知识库列表
  const initKnowledgeList = async () => {
    toggleListLoading(true);
    const [error, res] = await to(knowledgeApi.getKnowledgeList())
    if (!error) {
      knowledgeList.value = res.data
    }
    toggleListLoading(false);
  }

  // 重命名知识库
  const handleRename = async (id: string, name: string) => {
    // const [error, res] = await to(knowledgeApi.renameKnowledge(id, name))
    // if (!error) {
    //   knowledgeList.value = res.data
    // }
  }

  // 移除常用知识库
  const handleRemoveUsual = async (slug: string) => {
    // const [error, res] = await to(knowledgeApi.removeUsualKnowledge(id))
  }
  const handleDelete = async (slug: string, cb: Function) => {
    toggleDeleteLoading(true)
    const [error, res] = await to(knowledgeApi.deleteKnowledge(slug))
    toggleDeleteLoading(false)
    if (!error) {
      const index = knowledgeList.value.findIndex((item: KnowledgeItem) => item.slug === slug)
      knowledgeList.value.splice(index, 1)
      cb && typeof cb === 'function' && cb();
    }
  }
  // 拖拽结束
  const handleDragEnd = async (evt: { oldIndex: number, newIndex: number }) => {
    //   const [error, res] = await to(knowledgeApi.dragKnowledge(newIndex))
    // if (!error) {
    //   knowledgeList.value = res.data
    // }
    const { oldIndex, newIndex } = evt
    const moved = knowledgeList.value.splice(oldIndex, 1)[0]
    if (!moved) {
      return
    }
    knowledgeList.value.splice(newIndex, 0, moved)
  }

  return {
    listLoading,
    deleteLoading,
    knowledgeList,
    initKnowledgeList,
    handleRename,
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

