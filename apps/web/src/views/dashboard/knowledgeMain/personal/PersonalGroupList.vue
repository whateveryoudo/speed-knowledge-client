<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import to from 'await-to-js'
import { Modal, message } from 'ant-design-vue'
import {
  DeleteOutlined,
  DownOutlined,
  LockOutlined,
  MoreOutlined,
  PlusOutlined,
  UpOutlined,
} from '@ant-design/icons-vue'
import { knowledge as knowledgeApi } from '@sk/api'
import {
  DEFAULT_GROUP_DISPLAY_CONFIG,
  KnowledgeGroupType,
  type KnowledgeGroupDisplayConfig,
  type KnowledgeGroupItem,
  type KnowledgeItem,
} from '@sk/types'
import { useKnowledgeBookMenu } from '../../composables/useKnowledgeBookMenu'
import DeleteKnowledge from '../../components/deleteKnowledge/index.vue'
import AddKnowledge from '../../components/addMenu/AddKnowledge.vue'
import GroupStylePopover from './GroupStylePopover.vue'

const props = defineProps<{
  keyword: string
}>()

const router = useRouter()
const groups = ref<KnowledgeGroupItem[]>([])
const loading = ref(false)
const renamingGroupId = ref<string | null>(null)
const renameGroupInputRef = ref<HTMLInputElement | null>(null)
const openAddKnowledge = ref(false)
const addKnowledgeGroupId = ref<string | undefined>()

const {
  buildMenuItems,
  handleMenuClick,
  deleteKnowledgeVisible,
  renameInputRef,
  isRenaming,
  handleRenameBlur,
  currentBook,
} = useKnowledgeBookMenu()

const normalizeGroups = (list: KnowledgeGroupItem[]) =>
  list.map((group) => ({
    ...group,
    knowledge_items: group.knowledge_items ?? [],
    display_config: {
      ...DEFAULT_GROUP_DISPLAY_CONFIG,
      ...group.display_config,
    },
  }))

const fetchGroups = async () => {
  loading.value = true
  const keyword = props.keyword.trim() || undefined
  const [error, res] = await to(knowledgeApi.getKnowledgeGroupListDetail(keyword))
  loading.value = false
  if (!error) {
    groups.value = normalizeGroups(res.data)
  }
}

const startRenameGroup = (group: KnowledgeGroupItem) => {
  renamingGroupId.value = group.id
  setTimeout(() => {
    renameGroupInputRef.value?.focus()
  }, 100)
}

const onGroupNameBlur = async (group: KnowledgeGroupItem, value: string) => {
  if (renamingGroupId.value !== group.id) {
    return
  }
  renamingGroupId.value = null
  const name = value.trim()
  if (!name || name === group.group_name) {
    return
  }
  const [error] = await to(
    knowledgeApi.updateKnowledgeGroup(group.id, { group_name: name }),
  )
  if (!error) {
    group.group_name = name
    message.success('分组名称已更新')
  }
}

const onCreateGroup = async () => {
  const [error] = await to(knowledgeApi.createKnowledgeGroup())
  if (!error) {
    await fetchGroups()
    message.success('分组已创建')
  }
}

const onCreateKnowledge = (groupId: string) => {
  addKnowledgeGroupId.value = groupId
  openAddKnowledge.value = true
}

const onDeleteGroup = (group: KnowledgeGroupItem) => {
  if (group.is_default) {
    return
  }
  Modal.confirm({
    title: '删除分组',
    content: '删除后，分组下的知识库将移动到「我的知识库」分组',
    okText: '删除',
    cancelText: '取消',
    onOk: async () => {
      const [error] = await to(knowledgeApi.deleteKnowledgeGroup(group.id))
      if (!error) {
        await fetchGroups()
        message.success('分组已删除')
      }
    },
  })
}

const moveGroup = async (group: KnowledgeGroupItem, direction: 'up' | 'down') => {
  const idx = groups.value.findIndex((item) => item.id === group.id)
  const newIdx = direction === 'up' ? idx - 1 : idx + 1
  if (newIdx < 0 || newIdx >= groups.value.length) {
    return
  }
  const nextGroups = [...groups.value]
  const [removed] = nextGroups.splice(idx, 1)
  nextGroups.splice(newIdx, 0, removed)
  groups.value = nextGroups
  const [error] = await to(knowledgeApi.updateKnowledgeGroupOrder(group.id, newIdx))
  if (error) {
    await fetchGroups()
  }
}

const onGroupDragEnd = async (evt: { oldIndex: number; newIndex: number }) => {
  if (evt.oldIndex === evt.newIndex) {
    return
  }
  const moved = groups.value[evt.newIndex]
  if (!moved) {
    return
  }
  const [error] = await to(
    knowledgeApi.updateKnowledgeGroupOrder(moved.id, evt.newIndex),
  )
  if (error) {
    await fetchGroups()
  }
}

const onItemChange = async (
  evt: {
    moved?: { element: KnowledgeItem; newIndex: number }
    added?: { element: KnowledgeItem; newIndex: number }
  },
  groupId: string,
) => {
  const payload = evt.moved ?? evt.added
  if (!payload) {
    return
  }
  const [error] = await to(
    knowledgeApi.moveKnowledgeGroupRelation(payload.element.id, {
      group_id: groupId,
      order_index: payload.newIndex,
    }),
  )
  if (error) {
    await fetchGroups()
  }
}

const onStyleUpdate = async (
  group: KnowledgeGroupItem,
  displayConfig: KnowledgeGroupDisplayConfig,
) => {
  group.display_config = displayConfig
  const [error] = await to(
    knowledgeApi.updateKnowledgeGroup(group.id, { display_config: displayConfig }),
  )
  if (error) {
    await fetchGroups()
  }
}

const goKnowledge = (book: KnowledgeItem) => {
  if (isRenaming(book.id)) {
    return
  }
  router.push(`/${book.team.slug}/knowledge/${book.slug}`)
}

const onMenuClick = (e: { key: string }, book: KnowledgeItem) => {
  handleMenuClick(e.key, book)
}

const onDeleteSuccess = () => {
  fetchGroups()
}

const isCardLayout = (group: KnowledgeGroupItem) =>
  group.display_config?.type !== KnowledgeGroupType.LIST

const showIcon = (group: KnowledgeGroupItem) =>
  group.display_config?.show_knowledge_icon !== false

const showDescription = (group: KnowledgeGroupItem) =>
  group.display_config?.show_knowledge_description !== false

const hoveredGroupId = ref<string | null>(null)
const overlayOpenGroupIds = ref<Set<string>>(new Set())
const hideGroupTimers = new Map<string, ReturnType<typeof setTimeout>>()

const showGroupActions = (groupId: string) =>
  hoveredGroupId.value === groupId || overlayOpenGroupIds.value.has(groupId)

const clearHideGroupTimer = (groupId: string) => {
  const timer = hideGroupTimers.get(groupId)
  if (timer) {
    clearTimeout(timer)
    hideGroupTimers.delete(groupId)
  }
}

const onGroupMouseEnter = (groupId: string) => {
  clearHideGroupTimer(groupId)
  hoveredGroupId.value = groupId
}

const onGroupMouseLeave = (groupId: string) => {
  clearHideGroupTimer(groupId)
  hideGroupTimers.set(
    groupId,
    setTimeout(() => {
      if (!overlayOpenGroupIds.value.has(groupId)) {
        if (hoveredGroupId.value === groupId) {
          hoveredGroupId.value = null
        }
      }
      hideGroupTimers.delete(groupId)
    }, 200),
  )
}

const setGroupOverlayOpen = (groupId: string, open: boolean) => {
  const next = new Set(overlayOpenGroupIds.value)
  if (open) {
    clearHideGroupTimer(groupId)
    next.add(groupId)
  } else {
    next.delete(groupId)
    clearHideGroupTimer(groupId)
    hideGroupTimers.set(
      groupId,
      setTimeout(() => {
        if (!overlayOpenGroupIds.value.has(groupId) && hoveredGroupId.value !== groupId) {
          if (hoveredGroupId.value === groupId) {
            hoveredGroupId.value = null
          }
        }
        hideGroupTimers.delete(groupId)
      }, 200),
    )
  }
  overlayOpenGroupIds.value = next
}

watch(
  () => props.keyword,
  () => {
    fetchGroups()
  },
)

onMounted(() => {
  fetchGroups()
})

defineExpose({
  refresh: fetchGroups,
})
</script>

<template>
  <SkeletonList :loading="loading">
    <draggable v-if="groups.length > 0" v-model="groups" item-key="id" handle=".group-drag-handle" :animation="200"
      ghost-class="ghost-item" class="flex flex-col" @end="onGroupDragEnd">
      <template #item="{ element: group }">
        <section
          class="group-block border-0 border-b border-solid border-[var(--sd-border-light)] py-4"
          @mouseenter="onGroupMouseEnter(group.id)"
          @mouseleave="onGroupMouseLeave(group.id)"
        >
          <div class="flex items-center justify-between py-2 gap-2">
            <div class="flex min-w-0 items-center gap-2">
              <s-icon-font
                class="group-drag-handle cursor-move text-[var(--sd-grey-7)] transition-opacity"
                :class="showGroupActions(group.id) ? 'opacity-100' : 'opacity-0'"
                type="icon-kl-drag-handle"
                :size="18"
              />
              <a-input v-if="renamingGroupId === group.id" ref="renameGroupInputRef" size="small" class="max-w-[240px]"
                :value="group.group_name" @click.stop
                @blur="(e: FocusEvent) => onGroupNameBlur(group, (e.target as HTMLInputElement).value)" />
              <span v-else class="cursor-text truncate text-[15px] font-medium text-[var(--sd-text-grey-900)]"
                @click="startRenameGroup(group)">
                {{ group.group_name }}
              </span>
            </div>

            <div
              class="flex flex-1 items-center gap-2 transition-opacity"
              :class="showGroupActions(group.id) ? 'opacity-100' : 'pointer-events-none opacity-0'"
            >

              <div class="h-[1px] w-full flex-1 bg-[var(--sd-border-grey-4)]"></div>

              <div
                class="group-actions flex items-center gap-1 rounded-md border border-solid border-[var(--sd-border-grey-4)] bg-white px-2 py-1 shadow-sm"
              >
                <a-dropdown trigger="click" @openChange="(open: boolean) => setGroupOverlayOpen(group.id, open)">
                  <a-button type="text" class="shadow-btn-wrapper icon" @click.stop>
                    <template #icon>
                      <PlusOutlined />
                    </template>
                  </a-button>
                  <template #overlay>
                    <a-menu @click="(e: { key: string }) => {
                      if (e.key === 'knowledge') onCreateKnowledge(group.id)
                      if (e.key === 'group') onCreateGroup()
                    }">
                      <a-menu-item key="knowledge">新建知识库</a-menu-item>
                      <a-menu-item key="group">新建分组</a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
                <a-button type="text" class="shadow-btn-wrapper icon"
                  :disabled="groups.findIndex((item) => item.id === group.id) === 0"
                  @click.stop="moveGroup(group, 'up')">
                  <template #icon>
                    <UpOutlined />
                  </template>
                </a-button>
                <a-button type="text" class="shadow-btn-wrapper icon"
                  :disabled="groups.findIndex((item) => item.id === group.id) === groups.length - 1"
                  @click.stop="moveGroup(group, 'down')">
                  <template #icon>
                    <DownOutlined />
                  </template>
                </a-button>
                <GroupStylePopover
                  :group="group"
                  @update="(v) => onStyleUpdate(group, v)"
                  @open-change="(open) => setGroupOverlayOpen(group.id, open)"
                />
                <a-button v-if="!group.is_default" type="text" class="shadow-btn-wrapper icon"
                  @click.stop="onDeleteGroup(group)">
                  <template #icon>
                    <DeleteOutlined />
                  </template>
                </a-button>
              </div>
            </div>

          </div>

          <div class="pt-4">
            <draggable v-model="group.knowledge_items" group="knowledge-group-items" item-key="id" :animation="200"
              ghost-class="ghost-item" chosen-class="chosen-item" drag-class="drag-item" :class="isCardLayout(group)
                ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'flex flex-col gap-2'
                " @change="(evt) => onItemChange(evt, group.id)">
              <template #item="{ element: book }">
                <div
                  class="group/book relative cursor-pointer rounded-lg border border-solid border-[var(--sd-border-light)] bg-white transition-colors hover:border-[var(--sd-border-grey-4)]"
                  :class="isCardLayout(group) ? 'p-4' : 'flex items-center gap-3 px-3 py-2'" @click="goKnowledge(book)">
                  <s-icon-font
                    class="drag-handle absolute left-2 top-3 text-[var(--sd-grey-7)] opacity-0 transition-opacity group-hover/book:opacity-100"
                    type="icon-kl-drag-handle" :size="16" />
                  <div :class="isCardLayout(group)
                    ? 'flex flex-col gap-2 pl-4 h-[200px]'
                    : 'flex min-w-0 flex-1 items-center gap-3 pl-4'
                    ">
                    <div class="flex items-center gap-2">
                      <s-icon-font v-if="showIcon(group)" :type="book.icon" svg-sprite class="shrink-0"
                        style="width: 28px; height: 28px" />
                      <a-input v-if="isRenaming(book.id)" ref="renameInputRef" size="small" class="min-w-0 flex-1"
                        :value="book.name" @click.stop
                        @blur="(e: FocusEvent) => handleRenameBlur((e.target as HTMLInputElement).value, book)" />
                      <span v-else class="truncate text-[14px] font-medium text-[var(--sd-text-grey-900)]">
                        {{ book.name }}
                      </span>
                      <LockOutlined v-if="!book.is_public" class="text-[12px] text-[var(--sd-grey-7)]" />
                    </div>
                    <p v-if="showDescription(group) && book.description"
                      class="line-clamp-2 text-[12px] leading-[18px] text-[var(--sd-grey-7)]">
                      {{ book.description }}
                    </p>
                    <span class="text-[12px] text-[var(--sd-grey-7)]">
                      文档 {{ book.items_count ?? 0 }}
                    </span>
                  </div>
                  <a-dropdown trigger="click">
                    <a-button type="text"
                      class="shadow-btn-wrapper icon absolute right-2 top-2 opacity-0 transition-opacity group-hover/book:opacity-100"
                      @click.stop>
                      <template #icon>
                        <MoreOutlined />
                      </template>
                    </a-button>
                    <template #overlay>
                      <a-menu @click="(e: { key: string }) => onMenuClick(e, book)" :items="buildMenuItems(book)" />
                    </template>
                  </a-dropdown>
                </div>
              </template>
            </draggable>

            <button type="button"
              v-if="groups.length === 0"
              class="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--sd-border-grey-4)] bg-[var(--sd-bg-secondary)] py-8 text-[13px] text-[var(--sd-grey-7)] transition-colors hover:border-[var(--sd-primary-color)] hover:text-[var(--sd-primary-color)]"
              @click="onCreateKnowledge(group.id)">
              <PlusOutlined />
              新建知识库
            </button>
          </div>
        </section>
      </template>
    </draggable>
    <Empty0 v-else has-top description="暂无分组" />
  </SkeletonList>

  <AddKnowledge :open="openAddKnowledge" :default-group-id="addKnowledgeGroupId"
    @update:open="(v: boolean) => (openAddKnowledge = v)" @ok="fetchGroups" />

  <DeleteKnowledge v-model:visible="deleteKnowledgeVisible" :slug="currentBook?.slug ?? ''"
    :name="currentBook?.name ?? ''" @success="onDeleteSuccess" />
</template>

<style scoped lang="less">
:deep(.ghost-item) {
  opacity: 0.5;
}

:deep(.chosen-item) {
  cursor: move;
}

:deep(.drag-item) {
  opacity: 0.85;
}
</style>
