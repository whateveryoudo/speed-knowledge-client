<template>
    <a-flex vertical>
        <a-flex justify="space-between" align="center" class="fixed z-10 right-0 top-0 h-[52px]  px-[14px]"
            :style="{ left: `${knowledgeSidebarWidth}px` }">
            <span>
                <s-toggle-input :text="documentInfo?.name || '无标题文档'" :updateText="toggleInputChange"></s-toggle-input>
            </span>
            <a-space>
                <a-tooltip title="收藏">
                    <a-button type="text" class="shadow-btn-wrapper">

                        <StarOutlined class="text-[18px]" />

                    </a-button>
                </a-tooltip>
                <a-button type="primary" @click="changeToEdit">编辑</a-button>
            </a-space>
        </a-flex>
        <div class="flex-1 pt-[52px]">
            <!-- 文档显示 -->
            <SpeedTiptapEditor v-if="documentInfo.id" :editable="currentDocNode?.mode === 'edit'"
                :title="documentInfo.name" @update:title="knowledgeStore.handleUpdateDocumentName" scene="knowledge"
                v-bind="editorProps" />
        </div>

        <a-flex class="w-[1000px] mx-auto text-[var(--sd-grey-7)]">
            <a-space>
                <a-tooltip title="更新时间于 2025-10-10 20:00:00">
                    <ClockCircleOutlined />
                    今天 20:00
                </a-tooltip>
            </a-space>
        </a-flex>
    </a-flex>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useSystemStore } from '#sk-web/store/useSystemStore';
import { useKnowledgeStore } from '#sk-web/store/useKnowledgeStore';
import { useUserStore } from '#sk-web/store/useUserStore';
import { StarOutlined } from '@ant-design/icons-vue';
// 加载speed-tiptap-editor的组件
import { SpeedTiptapEditor } from 'speed-tiptap-editor-dev/debug'
const { knowledgeSidebarWidth } = storeToRefs(useSystemStore());
const knowledgeStore = useKnowledgeStore();
const { documentInfo, currentDocNode } = storeToRefs(knowledgeStore)
const { userInfo } = storeToRefs(useUserStore());

const editorProps = computed(() => {
    return {
        antdToken: {
            colorPrimary: '#00b96b',
        },
        upload: {
            // uploadApis: {
            //     fileDownload: fileDownload,
            //     fileUploadSingle: fileUploadSingle,
            //     fileUploadMulti: fileUploadMulti,
            //     fileDel: fileDel,
            //     // 主要用于图片预览
            //     getPreviewUrl: (fileId: string) => {
            //         // 实际情况替换为实际地址(此处为本地启动的node附件服务)
            //         const globalStore = useGlobalStore();
            //         const token = globalStore.openJwt ? localStorage.getItem('speed-tiptap-token') : 'speed-test-token'; // 未开启jwt 则使用一个模拟值
            //         return "//localhost:3005/attachment/preview/" + fileId + `?token=${token}`;
            //     },
            //     // 主要用于文件预览
            //     getFilePreviewUrl: (fileId: string) => {
            //         // 实际情况替换为实际地址(此处为本地启动的node附件服务)
            //         const globalStore = useGlobalStore();
            //         const token = globalStore.openJwt ? localStorage.getItem('speed-tiptap-token') : 'speed-test-token'; // 未开启jwt 则使用一个模拟值
            //         return "//localhost:3005/onlyoffice/filePreview/" + fileId + `?token=${token}`;
            //     },
            // },
        },
        collaboration: {
            documentId: documentInfo.value.id,
            url: import.meta.env.VITE_APP_COLLABORATE_URL + '/collaboration' + '?userId=' + userInfo.value.id + '&documentId=' + documentInfo.value.id + '&userName=' + userInfo.value.username,// 请先启动后端服务
        }
        // 增加ai配置： 目前仅支持 豆包大模型 配置
        // ai: {
        //     doubao: {
        //         // 对应后端请求（这里不要将敏感参数暴露在前端）
        //         url: '//localhost:3005/ai/doubao/stream',
        //         header: {
        //             'Authorization': `Bearer ${globalStore.openJwt ? localStorage.getItem('speed-tiptap-token') : 'speed-test-token'}`, // 未开启jwt 则使用一个模拟值
        //         },
        //         // 你可以自定义请求参数传入,构建系统的提示词（AIAction = 'refactor' | 'check' | 'simple' | 'rich' | 'translate' | 'summary' | 'custom'，content-编辑器选择的文本，customPrompt-用户输入的提示词）
        //         bodyParams: (action: string, content: string, customPrompt: string): Record<string, any> => {
        //             return {
        //                 action,
        //                 content,
        //                 customPrompt,
        //             }
        //         }
        //     }
        // }
    }
})
const toggleInputChange = (state: { text: string; flag: boolean }) => {
    knowledgeStore.handleUpdateDocumentName(state.text, () => {
        state.flag = false;
    })
}
const changeToEdit = () => {
    knowledgeStore.updateDocumentAttrs(documentInfo.value.id, {
        mode: 'edit',
    })
}
// 通过短链获取当前文档的详细信息
knowledgeStore.initDocumentDetail()
</script>
<style lang="less" scoped></style>