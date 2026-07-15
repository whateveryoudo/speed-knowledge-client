<template>
    <s-full-modal :width="500" :footer="false" :visible="visible" @cancel="handleClose" height="auto"
        title="文件导入">
        <Flex v-if="currentView === 'progress'" class="mb-2">
            <Space class="cursor-pointer text-[var(--ant-color-text-secondary)]" @click="backToSelect">
                <ArrowLeftOutlined />
                重新选择
            </Space>
        </Flex>

        <div v-show="currentView === 'select'" class="p-4 flex gap-4 justify-around">
            <div v-for="item in importItems" :key="item.value" @click="handlePickType(item)"
                class="w-[140px] py-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                <Flex vertical align="center" justify="center">
                    <img class="w-[70px] h-[70px]" :src="item.icon" />
                    <Tooltip :title="item.label">
                        <span class="text-sm truncate">{{ item.label }}</span>
                    </Tooltip>
                    <span class="text-xs text-gray-500">{{ item.desc }}</span>
                </Flex>
            </div>
        </div>

        <div v-show="currentView === 'progress' && importTasks.length > 0" class="px-2 pb-2">
            <div v-for="task in importTasks" :key="task.id"
                class="flex items-center justify-between p-3 border rounded-lg mb-2">
                <div class="flex items-center gap-3 min-w-0">
                    <img class="w-8 h-8 shrink-0" :src="task.icon" />
                    <div class="min-w-0">
                        <div class="text-sm font-medium truncate">{{ task.fileName }}</div>
                        <div class="text-xs text-gray-500">{{ task.type }}</div>
                    </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                    <Progress v-if="task.status === 'processing'" type="circle" trail-color="#e6f4ff"
                        :percent="task.progress" :stroke-width="20" :size="20" />
                    <CloseCircleOutlined v-if="task.status === 'error'" class="text-red-500 text-xl" />
                    <template v-if="task.status === 'success'">
                        <CheckCircleOutlined class="text-green-500 text-xl" />
                        <Button type="link" size="small" class="px-0" @click="handleView(task)">
                            查看
                        </Button>
                    </template>
                </div>
            </div>
            <div v-if="currentTaskTip" class="text-xs text-gray-500 px-1">{{ currentTaskTip }}</div>
        </div>

        <input ref="fileInputRef" type="file" class="hidden" :accept="acceptTypes" @change="handleFileChange" />
    </s-full-modal>
</template>

<script setup lang="ts">
import { Button, Flex, Progress, Space, Tooltip, message } from 'ant-design-vue'
import { ref, computed, watch } from 'vue'
import { ArrowLeftOutlined, CloseCircleOutlined, CheckCircleOutlined } from '@ant-design/icons-vue'
import WordIcon from '#sk-web/assets/images/menus/word.svg'
import MarkdownIcon from '#sk-web/assets/images/menus/markdown.svg'
import { document as documentApi } from '@sk/api'
import { DocumentImportFormat, type DocumentNodeItem } from '@sk/types'
import { to } from 'await-to-js'

const props = withDefaults(
    defineProps<{
        visible: boolean
        knowledgeId: string
        parentId?: string | null
    }>(),
    {
        visible: false,
        parentId: null,
    },
)

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'success', node: DocumentNodeItem): void
}>()

type ImportType = 'word' | 'markdown'

interface ImportItem {
    label: string
    value: ImportType
    icon: string
    desc: string
    accept: string
    format: DocumentImportFormat
}

interface ImportTask {
    id: string
    fileName: string
    type: string
    icon: string
    status: 'processing' | 'success' | 'error'
    progress: number
    resultNode?: DocumentNodeItem
}

const currentView = ref<'select' | 'progress'>('select')
const importTasks = ref<ImportTask[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)
const pendingType = ref<ImportItem | null>(null)

const importItems: ImportItem[] = [
    {
        label: 'Word',
        value: 'word',
        icon: WordIcon,
        desc: '.docx',
        accept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        format: DocumentImportFormat.WORD,
    },
    {
        label: 'Markdown',
        value: 'markdown',
        icon: MarkdownIcon,
        desc: '.md,.markdown',
        accept: '.md,.markdown,.mark,text/markdown,text/x-markdown',
        format: DocumentImportFormat.MARKDOWN,
    },
]

const acceptTypes = computed(() => pendingType.value?.accept ?? '')

const currentTaskTip = computed(() => {
    const task = importTasks.value[importTasks.value.length - 1]
    if (!task || task.status !== 'processing') return ''
    if (task.progress < 80) return '正在上传文件…'
    return '上传完成，正在服务端解析转换…'
})

const handleClose = () => {
    const busy = importTasks.value.some((t) => t.status === 'processing')
    if (busy) {
        message.warning('导入进行中，请稍候')
        return
    }
    emit('update:visible', false)
}

const backToSelect = () => {
    const busy = importTasks.value.some((t) => t.status === 'processing')
    if (busy) {
        message.warning('导入进行中，请稍候')
        return
    }
    currentView.value = 'select'
    importTasks.value = []
}

const handlePickType = (item: ImportItem) => {
    pendingType.value = item
    // 等 accept 更新后再触发选择
    requestAnimationFrame(() => {
        fileInputRef.value?.click()
    })
}

const updateCurrentTask = (updates: Partial<ImportTask>) => {
    const currentTask = importTasks.value[importTasks.value.length - 1]
    if (currentTask) {
        Object.assign(currentTask, updates)
    }
}

const handleFileChange = async (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    const typeItem = pendingType.value
    // 允许重复选择同一文件
    input.value = ''
    if (!file || !typeItem) return

    const task: ImportTask = {
        id: `${typeItem.value}_${Date.now()}`,
        fileName: file.name,
        type: typeItem.label,
        icon: typeItem.icon,
        status: 'processing',
        progress: 0,
    }
    importTasks.value = [task]
    currentView.value = 'progress'

    const [error, res] = await to(
        documentApi.importDocument(
            props.knowledgeId,
            {
                file,
                format: typeItem.format,
                parent_id: props.parentId,
            },
            (percent) => updateCurrentTask({ progress: percent }),
        ),
    )

    if (error || !res?.data) {
        updateCurrentTask({ status: 'error' })
        return
    }

    updateCurrentTask({ status: 'success', progress: 100, resultNode: res.data })
    message.success('导入成功')
}

const handleView = (task: ImportTask) => {
    if (!task.resultNode) return
    emit('success', task.resultNode)
    emit('update:visible', false)
}

watch(
    () => props.visible,
    (open) => {
        if (open) {
            importTasks.value = []
            currentView.value = 'select'
            pendingType.value = null
        }
    },
    { immediate: true },
)
</script>

<style scoped lang="less"></style>
