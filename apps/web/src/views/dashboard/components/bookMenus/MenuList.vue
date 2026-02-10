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

                <span class="book-title flex-1 text-[14px] truncate" :title="book.name">
                    {{ book.name }}
                </span>
                <LockOutlined class="text-[12px]" v-if="book.is_public" />
                <a-dropdown trigger="click">
                    <a-button type="text" @click.stop
                        class="shadow-btn-wrapper ml-1 icon group-hover:opacity-100  opacity-0" v-if="showMore">
                        <template #icon>
                            <MoreOutlined />
                        </template>
                    </a-button>
                    <template #overlay>
                        <a-menu @click="(e: any) => handleMenuClick(e, book)" :items="getMenuItems(book)" />
                    </template>
                </a-dropdown>
            </div>
        </template>
    </draggable>
    <DeleteKnowledge v-model:visible="deleteKnowledgeVisible" :slug="curBook?.slug ?? ''" :name="curBook?.name ?? ''" />
</template>

<script setup lang="ts">
import { ref, watch, h } from 'vue'
import draggable from 'vuedraggable'
import { LockOutlined, HolderOutlined, MoreOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { type KnowledgeItem } from '@sk/types'
import { cloneDeep } from 'lodash-es'
import { useRouter } from 'vue-router'
import type { ItemType } from 'ant-design-vue'
import DeleteKnowledge from '../deleteKnowledge/index.vue'
import { KnowledgeAbility } from '@sk/types'
const router = useRouter()


const props = withDefaults(defineProps<{
    books?: KnowledgeItem[]
    showMore?: boolean

}>(), {
    books: () => [],
    showMore: true,
})

const emit = defineEmits<{

    'drag-end': [evt: { oldIndex: number, newIndex: number }]
    'delete-trigger': [orderIndex: number]
}>()

const activeBookKey = props.activeBookKey || ''
const innerBooks = ref<KnowledgeItem[]>([])
const deleteKnowledgeVisible = ref(false)
const curBook = ref<KnowledgeItem | null>(null)
const getMenuItems = (book: KnowledgeItem): (ItemType & { hidden?: boolean })[] => {
    return [
        {
            label: '权限',
            key: 'auth',
            icon: () => h(LockOutlined)
        },
        { type: 'divider' as const, hidden: !book?.ability?.[KnowledgeAbility.DELETE_BOOK] },
        {
            label: '删除',
            danger: true,
            key: 'delete',
            icon: () => h(DeleteOutlined),
            hidden: !book?.ability?.[KnowledgeAbility.DELETE_BOOK]
        }
    ].filter((item) => !item.hidden)
}

const handleMenuClick = (e: any, book: KnowledgeItem) => {
    curBook.value = book
    switch (e.key) {
        case 'auth':
            router.push(`/${book.team.slug}/knowledge/${book.slug}/manage/auth`)
            break
        case 'delete':
            deleteKnowledgeVisible.value = true
            break
        default:
            break
    }
}

const onDragEnd = (evt: any) => {
    // 拖拽结束后，同步更新后的列表到父组件
    emit('drag-end', {
        oldIndex: evt.oldIndex,
        newIndex: evt.newIndex,
    })
}

const handleBookClick = (book: KnowledgeItem) => {
    router.push(`/${book.team.slug}/knowledge/${book.slug}`)
}

watch(() => props.books, (newVal) => {
    innerBooks.value = cloneDeep(newVal)
}, { immediate: true, deep: true })
</script>