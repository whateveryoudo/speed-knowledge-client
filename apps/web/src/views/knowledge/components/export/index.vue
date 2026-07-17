<template>
    <s-full-modal :width="580" :footer="false" :visible="visible" @cancel="handleClose" height="auto"
        title="文件导出">
        <Flex v-if="currentView === 'progress'" class="mb-2">
            <Space class="cursor-pointer text-[var(--ant-color-text-secondary)]" @click="backToSelect">
                <ArrowLeftOutlined />
                重新选择
            </Space>
        </Flex>

        <div v-show="currentView === 'select'" class="p-4 grid grid-cols-4 gap-4">
            <div v-for="item in exportItems" :key="item.key" @click="handleExport(item)"
                class="cursor-pointer hover:bg-gray-50 rounded-lg transition-colors">
                <Flex vertical align="center" justify="center">
                    <img class="w-[70px] h-[70px]" :src="item.icon" />
                    <Tooltip :title="item.label">
                        <span class="text-sm truncate">{{ item.label }}</span>
                    </Tooltip>
                    <span class="text-xs text-gray-500">{{ item.desc }}</span>
                </Flex>
            </div>
        </div>

        <div v-show="currentView === 'progress' && exportTasks.length > 0" class="px-2 pb-2">
            <div v-for="task in exportTasks" :key="task.id"
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
                        <Tooltip title="重新下载">
                            <DownloadOutlined class="cursor-pointer text-xl text-[var(--sd-link-color)]"
                                @click="handleRedownload(task)" />
                        </Tooltip>
                    </template>
                </div>
            </div>
            <div v-if="currentTaskTip" class="text-xs text-gray-500 px-1">{{ currentTaskTip }}</div>
            <div class="text-xs mt-2 text-gray-500 px-1" v-if="exportTasks.some(t => t.type === 'PDF')">pdf导出目前为图片导出，会导致pdf文件过大（待优化）</div>
            
        </div>
    </s-full-modal>
</template>

<script setup lang="ts">
import { Flex, Progress, Space, Tooltip, message } from 'ant-design-vue'
import { ref, computed, watch } from 'vue'
import {
    ArrowLeftOutlined,
    CloseCircleOutlined,
    CheckCircleOutlined,
    DownloadOutlined,
} from '@ant-design/icons-vue'
import { document as documentApi } from '@sk/api'
import { DocumentType } from '@sk/types'
import { downloadFileFromStream, handleExceptDown } from '@sk/utils'
import { to } from 'await-to-js'
import {
    getExportItemsForDocumentType,
    type DocumentExportItem,
} from './items'
import { downloadVisualExport, exportDocumentVisual } from './exportVisual'

const props = withDefaults(
    defineProps<{
        visible: boolean
        documentId: string
        documentTitle?: string
        /** 用于过滤导出项；默认 word 文档 */
        documentType?: DocumentType
        /** 可选：已加载的正文 JSON，避免重复请求 */
        contentJson?: string | null | Record<string, unknown>
    }>(),
    {
        visible: false,
        documentTitle: '',
        documentType: DocumentType.WORD,
        contentJson: null,
    },
)

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
}>()

interface ExportTask {
    id: string
    fileName: string
    type: string
    icon: string
    status: 'processing' | 'success' | 'error'
    progress: number
    tip?: string
    blob?: Blob
}

const currentView = ref<'select' | 'progress'>('select')
const exportTasks = ref<ExportTask[]>([])

const exportItems = computed(() => getExportItemsForDocumentType(props.documentType))

const currentTaskTip = computed(() => {
    const task = exportTasks.value[exportTasks.value.length - 1]
    if (!task || task.status !== 'processing') return ''
    return task.tip || '导出进行中…'
})

const fallbackFileName = (item: DocumentExportItem) => {
    const base = (props.documentTitle || 'document').trim() || 'document'
    return `${base}${item.ext}`
}

const handleClose = () => {
    const busy = exportTasks.value.some((t) => t.status === 'processing')
    if (busy) {
        message.warning('导出进行中，请稍候')
        return
    }
    emit('update:visible', false)
}

const backToSelect = () => {
    const busy = exportTasks.value.some((t) => t.status === 'processing')
    if (busy) {
        message.warning('导出进行中，请稍候')
        return
    }
    currentView.value = 'select'
    exportTasks.value = []
}

const updateCurrentTask = (updates: Partial<ExportTask>) => {
    const currentTask = exportTasks.value[exportTasks.value.length - 1]
    if (currentTask) {
        Object.assign(currentTask, updates)
    }
}

const runServerExport = async (item: DocumentExportItem) => {
    if (!item.serverFormat) {
        throw new Error('缺少服务端导出格式')
    }
    updateCurrentTask({ tip: '正在请求服务端导出…', progress: 10 })
    const [error, res] = await to(
        documentApi.exportDocument(props.documentId, item.serverFormat, (percent) =>
            updateCurrentTask({ progress: percent, tip: '正在下载文件…' }),
        ),
    )
    if (error || !res?.data) {
        throw error || new Error('导出失败')
    }
    const [downError, savedName] = await to(handleExceptDown(res, fallbackFileName(item)))
    if (downError) {
        throw downError
    }
    updateCurrentTask({
        status: 'success',
        progress: 100,
        fileName: savedName || fallbackFileName(item),
        blob: res.data,
        tip: '',
    })
}

const runClientExport = async (item: DocumentExportItem) => {
    if (!item.visualFormat) {
        throw new Error('缺少前端导出格式')
    }
    updateCurrentTask({ tip: '正在渲染文档…', progress: 10 })
    const result = await exportDocumentVisual({
        documentId: props.documentId,
        title: props.documentTitle,
        format: item.visualFormat,
        contentJson: props.contentJson,
        onProgress: (percent) => {
            const tip =
                percent < 40
                    ? '正在获取文档内容…'
                    : percent < 70
                      ? '正在渲染预览…'
                      : '正在生成文件…'
            updateCurrentTask({ progress: percent, tip })
        },
    })
    downloadVisualExport(result)
    updateCurrentTask({
        status: 'success',
        progress: 100,
        fileName: result.fileName,
        blob: result.blob,
        tip: '',
    })
}

const handleExport = async (item: DocumentExportItem) => {
    if (!props.documentId) {
        message.warning('缺少文档信息')
        return
    }

    const task: ExportTask = {
        id: `${item.key}_${Date.now()}`,
        fileName: fallbackFileName(item),
        type: item.label,
        icon: item.icon,
        status: 'processing',
        progress: 5,
        tip: '准备导出…',
    }
    exportTasks.value = [task]
    currentView.value = 'progress'

    const [error] = await to(
        item.channel === 'client' ? runClientExport(item) : runServerExport(item),
    )

    if (error) {
        updateCurrentTask({ status: 'error', tip: '' })
        message.error(error.message || '导出失败')
        return
    }
    message.success('导出成功')
}

const handleRedownload = (task: ExportTask) => {
    if (!task.blob) return
    downloadFileFromStream(task.blob, task.fileName)
}

watch(
    () => props.visible,
    (open) => {
        if (open) {
            exportTasks.value = []
            currentView.value = 'select'
        }
    },
    { immediate: true },
)
</script>

<style scoped lang="less"></style>
