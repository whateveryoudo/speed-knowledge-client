<template>

    <a-flex v-if="!documentError" vertical class="h-full">
        <a-flex justify="space-between" align="center"
            class="fixed bg-[#fff] z-10 right-0 top-0 h-[52px] pl-[14px] pr-[20px] border-b-solid border-b-[1px] border-b-[var(--sd-border-light)]"
            :style="{ left: showKnowledgeLeftPanel ? `${knowledgeSidebarWidth}px` : '0' }">
            <span>
                <s-toggle-input :text="documentInfo?.name || '无标题文档'" :updateText="toggleInputChange"></s-toggle-input>
            </span>
            <a-space>
                <CollaboratingPersonAvatars v-if="currentDocState?.mode === 'edit'"
                    :collaborators="collaborating_persons" />
                <CollaboratorAddPopver />
                <a-tooltip title="收藏" class="mr-2">
                    <a-button type="text" class="shadow-btn-wrapper"
                        @click="handleCollect(documentInfo.has_collected, { identifier: documentInfo.id, resource_type: CollectResourceType.DOCUMENT, onSuccess: () => { documentInfo.has_collected = !documentInfo.has_collected; } })">
                        <StarFilled v-if="documentInfo.has_collected"
                            style="font-size: 18px;color: var(--sd-yellow-6);" />
                        <StarOutlined v-else style="font-size: 18px;" />
                    </a-button>
                </a-tooltip>
                <DocumentShare />
                <a-button v-if="currentDocState.mode !== 'edit'" type="primary" @click="changeToEdit">编辑</a-button>
                <template v-if="currentDocState.mode === 'edit'">
                    <a-tooltip title="文档会自动更新到阅读页">
                        <a-button @click="setPreviewMode">
                            保存
                        </a-button>
                    </a-tooltip>
                </template>
                <a-space-compact block>
                    <a-button type="text" :class="['shadow-btn-wrapper', detectionPanelVisible ? 'is-active' : '']"
                        :icon="h(LayoutOutlined)" @click="() => toggleDetectionPanelVisible()">
                    </a-button>
                </a-space-compact>
            </a-space>
        </a-flex>
        <div class="pt-[52px]">
            <!-- 文档显示:追加key用于重置编辑器 -->
            <SkeletonList :loading="!knowledgeStore.showEditor"
                :style="!knowledgeStore.showEditor ? { padding: '20px 50px' } : {}">
                <SpeedTiptapEditor ref="editorRef" :json="documentContentJson" v-if="knowledgeStore.showEditor"
                    :headerStyle="{ position: 'fixed', top: '52px', left: `${knowledgeSidebarWidth}px`, right: '0', zIndex: 10 }"
                    :mainStyle="{ paddingTop: '40px' }" :key="documentInfo.id + '-' + currentDocState.mode"
                    :editable="currentDocState.mode === 'edit'" :menubar="currentDocState.mode === 'edit'"
                    :title="documentInfo.name" :documentSuggestConfig="{
                        rules
                    }"
                    @update:title="(val: string) => knowledgeStore.handleUpdateDocumentName(documentInfo.id, val, 'editor')"
                    scene="knowledge" v-bind="editorProps" @update:collaborators="handleCollaboratorsChange" />
            </SkeletonList>
        </div>

        <a-flex class="w-[1000px] mx-auto text-[var(--sd-grey-7)]" v-if="currentDocState.mode === 'preview'">
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
    <not-found v-else :title="documentError.errMessage" />
    <!-- 文档检测面板 -->
    <DetectionPanel v-model:visible="detectionPanelVisible" @onCheck="handleCheck" />
</template>
<script lang="ts" setup>
import { computed, ref, watch, h } from 'vue';
import { storeToRefs } from 'pinia';
import { useSystemStore } from '#sk-web/store/useSystemStore';
import { useKnowledgeStore } from '#sk-web/store/useKnowledgeStore';
import { useUserStore } from '#sk-web/store/useUserStore';
import { StarOutlined, LayoutOutlined } from '@ant-design/icons-vue';
import { transformDatatimeToRecentText } from '@sk/utils';
import CollaboratingPersonAvatars from '#sk-web/components/collaboratingPersons/index.vue';
import { useCollect } from '../hooks/useCollect';
import { type Collaborator, CollectResourceType } from '@sk/types';
import { CollaboratorAddPopver, DocumentShare } from '../components/documentCollaborator';
import { attachment as attachmentApi, apiVersion } from '@sk/api';
import { useToggle } from '@vueuse/core';
import DetectionPanel from './components/DetectionPanel.vue';
import dayjs from 'dayjs';
// 加载speed-tiptap-editor的组件
import { SpeedTiptapEditor } from 'speed-tiptap-editor-dev/debug'
const { knowledgeSidebarWidth } = storeToRefs(useSystemStore());
const knowledgeStore = useKnowledgeStore();
const { documentInfo, currentDocState, documentContentJson, showKnowledgeLeftPanel, documentError } = storeToRefs(knowledgeStore)
const { userInfo } = storeToRefs(useUserStore());
const collaborating_persons = ref<Collaborator[]>([]);
const { handleCollect } = useCollect();
const [detectionPanelVisible, toggleDetectionPanelVisible] = useToggle(false);
const editorRef = ref<InstanceType<typeof SpeedTiptapEditor>>();
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
type Rule = {
    id: string;
    name: string;
    description: string;
    severity: string;
    fixCommand: {
        action: string;
        params?: Record<string, any>;
    };
}
const rules = ref<Rule[]>([
    {
        id: 'RULE_TITLE_SIZE',
        name: '标题字号规范',
        description: '标题必须使用h1-h6, params的level可以返回1-6',
        severity: 'warning',
        fixCommand: {
            action: 'setHeading',
            params: {
                level: 1,
            }
        }
    },
    {
        id: 'RULE_TEXT_STYLE',
        name: '文本样式规范',
        description: '文字里面不能出现红色，文字块不能出现背景色, 你检测到后不用给参数给我',
        severity: 'warning',
        fixCommand: {
            action: 'resetTextStyle',
            params: {}
        }
    },
    {
        id: 'RULE_GRAMMAR_PROBLEM',
        name: '语法性问题',
        description: '语法性问题，你需要把纠错后的文本返回到fixCommand的params中的text字段中',
        severity: 'warning',
        fixCommand: {
            action: 'replaceText',
            params: {
                text: '',
            }
        }
    },
    // {
    //     id: 'RULE_FONT_FAMILY',
    //     name: '字体规范',
    //     description: '需采用仿宋字体',
    //     severity: 'error',
    //     fixCommand: {
    //         action: 'setFontFamily',
    //         params: {
    //             family: '仿宋',
    //         }
    //     }
    // },

])
const handleCheck = () => {
    editorRef.value?.editor?.chain().loadSuggestions().run();
}
watch(() => currentDocState.value.id, (val: string) => {
    // 通过短链获取当前文档的详细信息
    if (val) {
        knowledgeStore.initDocumentDetail()
    }
}, {
    immediate: true,
})

</script>
<style lang="less" scoped></style>