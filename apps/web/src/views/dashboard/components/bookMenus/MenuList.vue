<template>
    <draggable :list="innerBooks" :animation="200"
        :handle="dragHandleModeLocal === 'handle' ? '.drag-handle' : undefined" item-key="id" ghost-class="ghost-item"
        chosen-class="chosen-item" drag-class="drag-item" @start="onDragStart" @end="onDragEnd">
        <template #item="{ element: book }">
            <div class="book-item text-[var(--sd-text-body)] flex items-center h-[32px] my-[4px] px-[2px] rounded-[6px] hover:bg-[var(--sd-bg-primary-hover)] group"
                :class="{
                    'pr-2': !showMore,
                    'bg-[var(--sd-bg-primary-hover)]': activeBookKey === book.id,
                    'cursor-move': dragHandleModeLocal === 'full',
                    'cursor-pointer': dragHandleModeLocal === 'handle',
                }" @click="!isDragging && handleBookClick(book)" @dblclick="toggleDragMode">
                <a-button type="text" v-if="dragHandleModeLocal === 'handle'"
                    class="shadow-btn-wrapper icon mr-1 cursor-move group-hover:opacity-100  opacity-0">
                    <HolderOutlined />
                </a-button>
                <s-icon-font :type="book.icon" class="mr-2" svg-sprite style="width: 18px; height: 18px;" />

                <span class="book-title flex-1 text-[14px] truncate" :title="book.name">
                    {{ book.name }}
                </span>
                <LockOutlined class="text-[12px]" v-if="book.is_public" />

                <a-button type="text" class="shadow-btn-wrapper ml-1 icon group-hover:opacity-100  opacity-0"
                    v-if="showMore">
                    <template #icon>
                        <MoreOutlined />
                    </template>
                </a-button>
            </div>
        </template>
    </draggable>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import draggable from 'vuedraggable'
import { MenuOutlined, LockOutlined, HolderOutlined, MoreOutlined } from '@ant-design/icons-vue'
import { type KnowledgeItem } from '@sk/types'


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
}>()

const isDragging = ref(false)
const dragHandleModeLocal = ref<'handle' | 'full'>(props.dragHandleMode)
const activeBookKey = props.activeBookKey || ''
const innerBooks = ref<KnowledgeItem[]>([])


watch(() => props.dragHandleMode, (mode) => {
    dragHandleModeLocal.value = mode
})



const onDragStart = () => {
    isDragging.value = true
    emit('drag-start')
}

const onDragEnd = () => {
    isDragging.value = false
    emit('drag-end')
}

const toggleDragMode = () => {
    dragHandleModeLocal.value = dragHandleModeLocal.value === 'handle' ? 'full' : 'handle'
}

const handleBookClick = (book: KnowledgeItem) => {
    emit('update:activeBookKey', book.id)
}

watch(() => props.books, (newVal) => {
    innerBooks.value = newVal
}, { immediate: true })
</script>