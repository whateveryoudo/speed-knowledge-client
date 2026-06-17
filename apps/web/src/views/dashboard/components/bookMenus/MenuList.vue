<template>
    <draggable v-model="innerBooks" :animation="200" handle=".drag-handle" item-key="id" ghost-class="ghost-item"
        chosen-class="chosen-item" drag-class="drag-item" @end="onDragEnd">
        <template #item="{ element: book }">
            <div class="menu-item-base px-[2px]! hover:bg-[var(--sd-bg-primary-hover)] group" :class="{
                'pr-2': !showMore,
                'bg-[var(--sd-bg-primary-hover)]': activeBookKey === book.id,
                'cursor-pointer': true,
            }" @click="handleBookClick(book)">
                <a-button type="text"
                    class="shadow-btn-wrapper drag-handle icon cursor-move group-hover:opacity-100  opacity-0">
                    <HolderOutlined />
                </a-button>
                <s-icon-font :type="book.icon" class="mr-2" svg-sprite style="width: 18px; height: 18px;" />

                <a-input v-if="isRenaming(book.id)" ref="renameInputRef" size="small" class="flex-1 min-w-0"
                    :value="book.name" @click.stop
                    @blur="(e: FocusEvent) => handleRenameBlur((e.target as HTMLInputElement).value, book)" />
                <span v-else class="book-title flex-1 text-[14px] truncate" :title="book.name">
                    {{ book.name }}
                </span>
                <LockOutlined class="text-[12px]" v-if="!book.is_public" />
                <a-dropdown trigger="click">
                    <a-button type="text" @click.stop
                        class="shadow-btn-wrapper ml-1 icon group-hover:opacity-100  opacity-0" v-if="showMore">
                        <template #icon>
                            <MoreOutlined />
                        </template>
                    </a-button>
                    <template #overlay>
                        <a-menu @click="(e: any) => onMenuClick(e, book)"
                            :items="buildMenuItems(book, { showUnpinInMenu: true })" />
                    </template>
                </a-dropdown>
            </div>
        </template>
    </draggable>
    <DeleteKnowledge v-model:visible="deleteKnowledgeVisible" :slug="currentBook?.slug ?? ''"
        :name="currentBook?.name ?? ''" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import { LockOutlined, HolderOutlined, MoreOutlined } from '@ant-design/icons-vue'
import { type KnowledgeItem } from '@sk/types'
import { cloneDeep } from 'lodash-es'
import { useRouter } from 'vue-router'
import DeleteKnowledge from '../deleteKnowledge/index.vue'
import { useKnowledgeBookMenu } from '../../composables/useKnowledgeBookMenu'

const router = useRouter()

const props = withDefaults(defineProps<{
    books?: KnowledgeItem[]
    showMore?: boolean
    activeBookKey?: string
}>(), {
    books: () => [],
    showMore: true,
    activeBookKey: '',
})

const emit = defineEmits<{
    'drag-end': [evt: { oldIndex: number, newIndex: number }]
}>()

const innerBooks = ref<KnowledgeItem[]>([])
const {
    buildMenuItems,
    handleMenuClick,
    deleteKnowledgeVisible,
    renameInputRef,
    isRenaming,
    handleRenameBlur,
    currentBook,
} = useKnowledgeBookMenu()

const onMenuClick = (e: { key: string }, book: KnowledgeItem) => {
    handleMenuClick(e.key, book)
}

const onDragEnd = (evt: { oldIndex: number; newIndex: number }) => {
    emit('drag-end', {
        oldIndex: evt.oldIndex,
        newIndex: evt.newIndex,
    })
}

const handleBookClick = (book: KnowledgeItem) => {
    if (isRenaming(book.id)) {
        return
    }
    router.push(`/${book.team.slug}/knowledge/${book.slug}`)
}

watch(() => props.books, (newVal) => {
    innerBooks.value = cloneDeep(newVal)
}, { immediate: true, deep: true })
</script>
