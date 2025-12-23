<template>
    <draggable v-model:list="innerBooks" :animation="200" handle=".drag-handle" item-key="id" ghost-class="ghost-item"
        chosen-class="chosen-item" drag-class="drag-item" @start="onDragStart" @end="onDragEnd">
        <template #item="{ element: book }">
            <div class="menu-item-base px-[2px]! hover:bg-[var(--sd-bg-primary-hover)] group"
                :class="{
                    'pr-2': !showMore,
                    'bg-[var(--sd-bg-primary-hover)]': activeBookKey === book.id,
                    'cursor-pointer': true,
                }" @click="handleBookClick(book)">
                <a-button type="text"
                    class="shadow-btn-wrapper drag-handle icon mr-1 cursor-move group-hover:opacity-100  opacity-0">
                    <HolderOutlined />
                </a-button>
                <s-icon-font :type="book.icon" class="mr-2" svg-sprite style="width: 18px; height: 18px;" />

                <span class="book-title flex-1 text-[14px] truncate" :title="book.name">
                    {{ book.name }}
                </span>
                <LockOutlined class="text-[12px]" v-if="book.is_public" />
                <a-dropdown trigger="click">
                    <a-button type="text"  @click.stop class="shadow-btn-wrapper ml-1 icon group-hover:opacity-100  opacity-0"
                        v-if="showMore">
                        <template #icon>
                            <MoreOutlined />
                        </template>
                    </a-button>
                    <template #overlay>
                        <a-menu @click="(e: any) => handleMenuClick(e, book)" :items="menuItems"/>
                    </template>
                </a-dropdown>
            </div>
        </template>
    </draggable>
</template>

<script setup lang="ts">
import { ref, watch, h } from 'vue'
import draggable from 'vuedraggable'
import { LockOutlined, HolderOutlined, MoreOutlined } from '@ant-design/icons-vue'
import { type KnowledgeItem } from '@sk/types'
import { cloneDeep } from 'lodash-es'
import { useRouter } from 'vue-router'
import type { ItemType } from 'ant-design-vue'
const router = useRouter()


const props = withDefaults(defineProps<{
    books?: KnowledgeItem[]
    activeBookKey?: string
    dragHandleMode?: 'handle' | 'full'
    showMore?: boolean
}>(), {
    books: () => [],
    activeBookKey: '',
    dragHandleMode: 'handle',
    showMore: true,
})

const emit = defineEmits<{
    'update:activeBookKey': [key: string]
    'book-click': [book: KnowledgeItem]
    'drag-start': []
    'drag-end': []
    'update:books': [books: KnowledgeItem[]]
}>()

const activeBookKey = props.activeBookKey || ''
const innerBooks = ref<KnowledgeItem[]>([])

const menuItems = ref<ItemType[]>([
    {
        label: '权限',
        key: 'auth',
        icon: () => h(LockOutlined)
    }
])
const handleMenuClick = (e: any, book: KnowledgeItem) => {
    switch (e.key) {
        case 'auth':
            router.push(`/knowledge/${book.slug}/manage/auth`)
            break
        default:
            break
    }
}
const onDragStart = () => {
    emit('drag-start')
}

const onDragEnd = () => {
    // 拖拽结束后，同步更新后的列表到父组件
    // emit('update:books', innerBooks.value)
    emit('drag-end')
}

const handleBookClick = (book: KnowledgeItem) => {
    router.push(`/knowledge/${book.slug}`)
}

watch(() => props.books, (newVal) => {
    innerBooks.value = cloneDeep(newVal)
}, { immediate: true })
</script>