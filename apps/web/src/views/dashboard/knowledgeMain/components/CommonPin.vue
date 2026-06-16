<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import { Collapse } from 'vue-collapsed'
import { LockOutlined, UpOutlined, DownOutlined, MoreOutlined } from '@ant-design/icons-vue'
import type { KnowledgeCommonPinItem } from '@sk/types'
import { cloneDeep } from 'lodash-es'
import { useKnowledgeList } from '../../composables/useKnowledgeListContext'
import { useKnowledgeBookMenu } from '../../composables/useKnowledgeBookMenu'
import DeleteKnowledge from '../../components/deleteKnowledge/index.vue'

const router = useRouter()
const expanded = ref(true)
const innerList = ref<KnowledgeCommonPinItem[]>([])
const {
    commonPinList,
    commonPinLoading,
    handleDragEnd,
} = useKnowledgeList()

const {
    buildMenuItems,
    handleMenuClick,
    deleteKnowledgeVisible,
    renameInputRef,
    isRenaming,
    handleRenameBlur,
    currentBook,
} = useKnowledgeBookMenu()

watch(
    () => commonPinList.value,
    (list) => {
        innerList.value = cloneDeep(list)
    },
    { immediate: true, deep: true },
)

const toggleExpanded = () => {
    expanded.value = !expanded.value
}

const handleBookClick = (pin: KnowledgeCommonPinItem) => {
    if (isRenaming(pin.knowledge.id)) {
        return
    }
    router.push(`/${pin.knowledge.team.slug}/knowledge/${pin.knowledge.slug}`)
}

const onDragEnd = (evt: { oldIndex: number; newIndex: number }) => {
    handleDragEnd(evt)
}

const onMenuClick = (e: { key: string }, pin: KnowledgeCommonPinItem) => {
    handleMenuClick(e.key, pin.knowledge)
}
</script>

<template>
    <section class="common-pin-section rounded-lg bg-[var(--sd-bg-secondary)] px-4 py-3">
        <div class="mb-3 flex items-center justify-between">
            <span class="text-[15px] font-medium text-[var(--sd-text-grey-900)]">常用</span>
            <button type="button"
                class="flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-[13px] text-[var(--sd-grey-7)]"
                @click="toggleExpanded">
                {{ expanded ? '收起' : '展开' }}
                <UpOutlined v-if="expanded" class="text-[12px]" />
                <DownOutlined v-else class="text-[12px]" />
            </button>
        </div>

        <Collapse :when="expanded">
            <SkeletonList :loading="commonPinLoading">
                <draggable v-if="innerList.length > 0" v-model="innerList" item-key="id" :animation="200"
                    ghost-class="ghost-item" chosen-class="chosen-item" drag-class="drag-item"
                    class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3" @end="onDragEnd">
                    <template #item="{ element: pin }">
                        <div class="common-pin-card group flex cursor-pointer gap-3 rounded-lg border border-solid border-[var(--sd-border-light)] bg-white p-3 transition-colors hover:border-[var(--sd-border-grey-4)]"
                            @click="handleBookClick(pin)">
                            <s-icon-font class="drag-handle" type="icon-kl-drag-handle" :size="20"></s-icon-font>
                            <s-icon-font :type="pin.knowledge.icon" svg-sprite class="shrink-0"
                                style="width: 28px; height: 28px;" />
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-2">
                                    <a-input v-if="isRenaming(pin.knowledge.id)" ref="renameInputRef" size="small"
                                        class="min-w-0 flex-1" :value="pin.knowledge.name" @click.stop
                                        @blur="(e: FocusEvent) => handleRenameBlur((e.target as HTMLInputElement).value, pin.knowledge)" />
                                    <span v-else
                                        class="truncate text-[14px] font-medium text-[var(--sd-text-grey-900)]">
                                        {{ pin.knowledge.name }}
                                    </span>
                                    <LockOutlined v-if="!pin.knowledge.is_public"
                                        class="text-[12px] text-[var(--sd-grey-7)]" />
                                </div>
                                <p v-if="pin.knowledge.description"
                                    class="mt-1 line-clamp-2 text-[12px] leading-[18px] text-[var(--sd-grey-7)]">
                                    {{ pin.knowledge.description }}
                                </p>
                            </div>
                            <a-dropdown trigger="click">
                                <a-button type="text" @click.stop
                                    class="shadow-btn-wrapper icon opacity-0 group-hover:opacity-100">
                                    <template #icon>
                                        <MoreOutlined />
                                    </template>
                                </a-button>
                                <template #overlay>
                                    <a-menu @click="(e: any) => onMenuClick(e, pin)"
                                        :items="buildMenuItems(pin.knowledge, { isPinned: true })" />
                                </template>
                            </a-dropdown>
                        </div>
                    </template>
                </draggable>
                <Empty0 v-else has-top description="暂无常用知识库" />
            </SkeletonList>
        </Collapse>
    </section>

    <DeleteKnowledge v-model:visible="deleteKnowledgeVisible" :slug="currentBook?.slug ?? ''"
        :name="currentBook?.name ?? ''" />
</template>

<style scoped lang="less">
.common-pin-card {
    user-select: none;
    position: relative;
    padding-left: 25px;

    .drag-handle {
        visibility: hidden;
        position: absolute;
        left: 5px;
        top: 10px;

    }

    &:hover {
        .drag-handle {
            visibility: visible;
        }
    }
}

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
