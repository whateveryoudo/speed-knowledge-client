<template>
    <a-flex vertical class="h-full">
        <a-flex justify="space-between" align="center"
            class="fixed bg-[#fff] z-10 right-0 top-0 h-[52px] pl-[14px] pr-[50px] border-b-solid border-b-[1px] border-b-[var(--sd-border-light)]"
            :style="{ left: `${knowledgeSidebarWidth}px` }">
            <span>
                <s-toggle-input :text="documentInfo?.name || '无标题文档'" :updateText="toggleInputChange"></s-toggle-input>
            </span>
            <a-space>
                <CollaboratingPersonAvatars v-if="currentDocNode?.mode === 'edit'"
                    :collaborators="collaborating_persons" />
                <CollaboratorAddPopver />
                <a-tooltip title="收藏" class="mr-2">
                    <a-button type="text" class="shadow-btn-wrapper"
                        @click="handleCollect(documentInfo.has_collected, { identifier: documentInfo.id, resource_type: CollectResourceType.DOCUMENT, onSuccess: () => { documentInfo.has_collected = !documentInfo.has_collected; } })">
                        <StarFilled v-if="documentInfo.has_collected" style="color: var(--sd-yellow-6);" />
                        <StarOutlined v-else />
                    </a-button>
                </a-tooltip>
                <DocumentShare />
                <a-button v-if="currentDocNode.mode !== 'edit'" type="primary" @click="changeToEdit">编辑</a-button>
                <template v-if="currentDocNode.mode === 'edit'">
                    <a-tooltip title="文档会自动更新到阅读页">
                        <a-button @click="setPreviewMode">
                            保存
                        </a-button>
                    </a-tooltip>
                </template>
            </a-space>
        </a-flex>
        <div>
            <!-- 文档显示:追加key用于重置编辑器 -->
            <SkeletonList :loading="!knowledgeStore.showEditor">
                <SpeedTiptapEditor :json="documentContentJson" v-if="knowledgeStore.showEditor"
                    :headerStyle="{ position: 'fixed', top: '52px', left: `${knowledgeSidebarWidth}px`, right: '0', zIndex: 10 }"
                    :mainStyle="{ paddingTop: '92px' }" :key="documentInfo.id + '-' + currentDocNode.mode"
                    :editable="currentDocNode.mode === 'edit'" :menubar="currentDocNode.mode === 'edit'"
                    :title="documentInfo.name"
                    @update:title="(val: string) => knowledgeStore.handleUpdateDocumentName(documentInfo.id, val, 'editor')"
                    scene="knowledge" v-bind="editorProps" @update:collaborators="handleCollaboratorsChange" />
            </SkeletonList>
        </div>

        <a-flex class="w-[1000px] mx-auto text-[var(--sd-grey-7)]" v-if="currentDocNode.mode === 'preview'">
            <a-space :size="10">
                <a-tooltip :title="`更新时间于 ${dayjs(documentInfo.content_updated_at).format('YYYY-MM-DD HH:mm:ss')}`">
                    <ClockCircleOutlined />
                    {{ transformDatatimeToRecentText(documentInfo.content_updated_at) }}
                </a-tooltip>
                <a-tooltip :title="`文档浏览次数 ${documentInfo.view_count}`">
                    <ReadOutlined />
                    {{ documentInfo.view_count }}
                </a-tooltip>
            </a-space>
        </a-flex>
    </a-flex>
</template>
<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSystemStore } from '#sk-web/store/useSystemStore';
import { useKnowledgeStore } from '#sk-web/store/useKnowledgeStore';
import { useUserStore } from '#sk-web/store/useUserStore';
import { StarOutlined } from '@ant-design/icons-vue';
import { transformDatatimeToRecentText } from '@sk/utils';
import CollaboratingPersonAvatars from '#sk-web/components/collaboratingPersons/index.vue';
import { useCollect } from '../hooks/useCollect';
import { type Collaborator, CollectResourceType } from '@sk/types';
import { CollaboratorAddPopver, DocumentShare } from '../components/documentCollaborator';
import { attachment as attachmentApi, apiVersion } from '@sk/api';
import dayjs from 'dayjs';
// 加载speed-tiptap-editor的组件
import { SpeedTiptapEditor } from 'speed-tiptap-editor-dev/debug'
const { knowledgeSidebarWidth } = storeToRefs(useSystemStore());
const knowledgeStore = useKnowledgeStore();
const { documentInfo, currentDocNode, documentContentJson } = storeToRefs(knowledgeStore)
const { userInfo } = storeToRefs(useUserStore());
const collaborating_persons = ref<Collaborator[]>([]);
const { handleCollect } = useCollect();
const editorProps = computed(() => {
    const baseUrl = import.meta.env.VITE_APP_PROXY_URL + apiVersion;
    return {
        antdToken: {
            colorPrimary: '#00b96b',
        },
        collaboration: {
            documentId: documentInfo.value.id,
            url: import.meta.env.VITE_APP_COLLABORATE_URL + '/collaboration' + '?userId=' + userInfo.value.id + '&documentId=' + documentInfo.value.id + '&userName=' + userInfo.value.username,// 请先启动后端服务
            token: window.localStorage.getItem("access_token"),
            user: userInfo.value
        },
        // 增加ai配置： 目前仅支持 豆包大模型 配置
        ai: {
            doubao: {
                // 对应后端请求（这里不要将敏感参数暴露在前端）
                url: baseUrl + '/ai/doubao/stream',
                header: {
                    'Authorization': `Bearer ${window.localStorage.getItem('access_token')}`,
                },
                // 你可以自定义请求参数传入,构建系统的提示词（AIAction = 'refactor' | 'check' | 'simple' | 'rich' | 'translate' | 'summary' | 'custom'，content-编辑器选择的文本，customPrompt-用户输入的提示词）
                bodyParams: (action: string, content: string, customPrompt: string): Record<string, any> => {
                    return {
                        action,
                        content,
                        customPrompt,
                    }
                }
            }
        }
    }
})
const toggleInputChange = (state: { text: string; flag: boolean }) => {
    knowledgeStore.handleUpdateDocumentName(documentInfo.value.id, state.text, 'outer', () => {
        state.flag = false;
    })
}
const changeToEdit = () => {
    knowledgeStore.updateDocumentAttrs(documentInfo.value.id, {
        mode: 'edit',
    })
}
// 监听协同人员变化(顶部显示)
const handleCollaboratorsChange = (collaborators: Collaborator[]) => {
    collaborating_persons.value = collaborators;
}
const setPreviewMode = () => {
    knowledgeStore.updateDocumentAttrs(documentInfo.value.id, { mode: 'preview' })
    knowledgeStore.initDocumentDetail(false)// 重新获取文档内容
}
watch(() => currentDocNode.value.id, (val: string) => {
    // 通过短链获取当前文档的详细信息
    if (val) {
        knowledgeStore.initDocumentDetail()
    }
}, {
    immediate: true,
})

</script>
<style lang="less" scoped></style>