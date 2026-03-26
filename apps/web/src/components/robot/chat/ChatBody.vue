<template>
    <div class="chat-history">
        <!-- Toggle Sidebar Button (Visible when sidebar closed) -->
        <button v-if="!isSidebarOpen" @click="isSidebarOpen = true"
            class="absolute left-4 top-4 z-20 p-2.5 bg-white border border-slate-200 shadow-lg rounded-xl text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all">
            <ListIcon class="w-5 h-5" />
        </button>
        <!-- 顶部描述 -->
        <div v-if="!activeConversationId" class="p-6 text-center animate-fadeIn">
            <!-- <div class="w-[72px] h-[72px] mx-auto rounded-2xl flex items-center justify-center mb-5 shadow-sm"
                :class="getColorClass(config.agentInfo.color)">
                <component :is="config.agentInfo.icon" class="w-9 h-9" />
            </div> -->
            <div>
                <i data-v-1f7d2cd4="" class="ed-icon" style="font-size: 32px;">
                    <svg data-v-1f7d2cd4="" width="30" height="30" viewBox="0 0 30 30" fill="#0052D9" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_5963_38466)">
                            <path d="M28.3328 13.6689H28.1019C28.2398 14.4271 28.3088 15.1961 28.3083 15.9666C28.3132 16.913 28.2005 17.8563 27.9729 18.7749H28.6236C28.9021 18.7749 29.1691 18.6643 29.3661 18.4674C29.563 18.2705 29.6736 18.0034 29.6736 17.7249V15.0099C29.6736 14.8339 29.6389 14.6595 29.5716 14.4968C29.5042 14.3341 29.4054 14.1863 29.2809 14.0617C29.1564 13.9372 29.0086 13.8384 28.8459 13.771C28.6832 13.7036 28.5088 13.669 28.3328 13.6689Z" class="icon-primary"></path>
                            <path d="M1.69164 15.9666C1.69114 15.1961 1.76022 14.4271 1.89804 13.6689H1.66727C1.31164 13.669 0.970593 13.8102 0.719137 14.0617C0.467681 14.3132 0.326416 14.6542 0.326416 15.0099V17.7249C0.326416 18.0033 0.437041 18.2704 0.633954 18.4673C0.830867 18.6642 1.09794 18.7749 1.37642 18.7749H2.02712C1.79945 17.8563 1.68676 16.913 1.69164 15.9666Z" fill="var(--ed-color-primary)"></path>
                            <path d="M15 3.79492C8.11089 3.79492 2.52625 9.07725 2.52625 15.9664C2.52625 22.8555 8.11097 26.2049 15 26.2049C21.8891 26.2049 27.4737 22.8557 27.4737 15.9667C27.4737 9.07762 21.8891 3.79492 15 3.79492ZM18.0265 21.1252H11.9735C11.1168 21.1264 10.2697 20.9439 9.48954 20.5899C8.92592 20.334 7.28177 20.8715 6.82704 20.463C6.27602 19.968 6.94405 18.4942 6.6058 17.827C6.1792 16.9852 5.95758 16.0545 5.959 15.1108C5.959 13.5157 6.59265 11.986 7.72055 10.8581C8.84845 9.73017 10.3782 9.09652 11.9733 9.09652H18.0263C19.6214 9.09652 21.1512 9.73017 22.2791 10.8581C23.407 11.986 24.0407 13.5157 24.0407 15.1108C24.0407 15.9007 23.8852 16.6828 23.583 17.4125C23.2808 18.1422 22.8378 18.8052 22.2793 19.3638C21.7208 19.9223 21.0578 20.3653 20.3282 20.6676C19.5985 20.9699 18.8164 21.1255 18.0266 21.1255L18.0265 21.1252Z" class="icon-primary"></path>
                            <path d="M15 3.79492C8.11089 3.79492 2.52625 9.07725 2.52625 15.9664C2.52625 22.8555 8.11097 26.2049 15 26.2049C21.8891 26.2049 27.4737 22.8557 27.4737 15.9667C27.4737 9.07762 21.8891 3.79492 15 3.79492ZM18.0265 21.1252H11.9735C11.1168 21.1264 10.2697 20.9439 9.48954 20.5899C8.92592 20.334 7.28177 20.8715 6.82704 20.463C6.27602 19.968 6.94405 18.4942 6.6058 17.827C6.1792 16.9852 5.95758 16.0545 5.959 15.1108C5.959 13.5157 6.59265 11.986 7.72055 10.8581C8.84845 9.73017 10.3782 9.09652 11.9733 9.09652H18.0263C19.6214 9.09652 21.1512 9.73017 22.2791 10.8581C23.407 11.986 24.0407 13.5157 24.0407 15.1108C24.0407 15.9007 23.8852 16.6828 23.583 17.4125C23.2808 18.1422 22.8378 18.8052 22.2793 19.3638C21.7208 19.9223 21.0578 20.3653 20.3282 20.6676C19.5985 20.9699 18.8164 21.1255 18.0266 21.1255L18.0265 21.1252Z" class="icon-primary"></path>
                            <path d="M10.5456 14.915H8.76648V18.7946H10.5456V14.915Z" class="icon-primary"></path>
                            <path d="M14.1198 13.1934H12.3407V18.7947H14.1198V13.1934Z" class="icon-primary"></path>
                            <path d="M17.6939 15.438H15.9148V18.7945H17.6939V15.438Z" class="icon-primary"></path>
                            <path d="M21.2334 12.4521H19.4543V18.7946H21.2334V12.4521Z" class="icon-primary"></path>
                        </g>
                        <defs>
                            <linearGradient id="paint0_linear_5963_38466" x1="6.6502" y1="4.4409" x2="25.0992" y2="29.249" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#B2F288"></stop><stop offset="0.181" stop-color="#80D79C"></stop><stop offset="0.371" stop-color="#52BEAD"></stop>
                                <stop offset="0.554" stop-color="#2FAABB"></stop><stop offset="0.724" stop-color="#159CC5"></stop>
                                <stop offset="0.878" stop-color="#0594CB"></stop><stop offset="1" stop-color="#0091CD"></stop>
                            </linearGradient>
                            <linearGradient id="paint1_linear_5963_38466" x1="6.6502" y1="4.4409" x2="25.0992" y2="29.249" gradientUnits="userSpaceOnUse">
                                <stop stop-color="#B2F288"></stop><stop offset="0.181" stop-color="#80D79C"></stop><stop offset="0.371" stop-color="#52BEAD"></stop>
                                <stop offset="0.554" stop-color="#2FAABB"></stop>
                                <stop offset="0.724" stop-color="#159CC5"></stop>
                                <stop offset="0.878" stop-color="#0594CB"></stop>
                                <stop offset="1" stop-color="#0091CD"></stop>
                            </linearGradient>
                            <clipPath id="clip0_5963_38466">
                                <rect width="30" height="30" fill="white"></rect>
                            </clipPath>
                        </defs>
                    </svg>
                </i>
            </div>
            <h2 class="text-xl font-bold text-slate-800 mb-2">{{ config.agentInfo.title }}</h2>
            <p class="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">{{ config.agentInfo.description }}</p>
        </div>
        <!-- 开场白 -->
        <div class="answer-bubble" v-if="!activeConversationId && conversationsParameters.opening_statement">
            <!-- <div
                class="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 mt-0.5 shadow-sm">
                <SparklesIcon class="w-5 h-5" />
            </div> -->
            <div class="answer-content">
                {{ conversationsParameters.opening_statement }}
                <!-- 建议项 -->
                <div class="flex items-center flex-wrap" v-if="conversationsParameters.suggested_questions">
                    <div class="mr-1.5 mt-1.5 inline-flex max-w-full text-[#155aef] font-bold shrink-0 cursor-pointer flex-wrap rounded-lg border-[0.5px] border-[#10182824] bg-components-button-secondary-bg px-3 py-1.5 text-components-button-secondary-accent-text shadow-xs last:mr-0 hover:border-components-button-secondary-border-hover hover:bg-[#f9fafb]"
                        v-for="question in conversationsParameters.suggested_questions" :key="question" @click="sendQuestion({
                            question: question,
                        })">
                        {{ question }}
                    </div>
                </div>
            </div>

        </div>

        <div v-if="chatHistory.length" class="ai-response">
            <div v-for="(chat, chatIndex) in chatHistory" :key="chatIndex" class="chat-item">
                <div class="flex items-center justify-end mb-[12px]">
                    <div
                        class="item-as max-w-[85%] bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-3 rounded-2xl rounded-br-md text-[15px] leading-relaxed">
                        {{ chat.question }}
                    </div>
                </div>

                <div class="answer-bubble">
                    <!-- 头像 -->
                    <!-- <div
                        class="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 mt-0.5 shadow-sm">
                        <SparklesIcon class="w-5 h-5" />
                    </div> -->
                    <div class="tx">
                        <i data-v-cc2c3d01="" class="ed-icon"><svg data-v-cc2c3d01="" width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M28.3328 13.669H28.1019C28.2398 14.4271 28.3088 15.1961 28.3083 15.9667C28.3132 16.9131 28.2005 17.8564 27.9729 18.775H28.6236C28.9021 18.775 29.1691 18.6644 29.3661 18.4674C29.563 18.2705 29.6736 18.0035 29.6736 17.725V15.01C29.6736 14.8339 29.6389 14.6595 29.5716 14.4968C29.5042 14.3341 29.4054 14.1863 29.2809 14.0618C29.1564 13.9373 29.0086 13.8385 28.8459 13.7711C28.6832 13.7037 28.5088 13.669 28.3328 13.669Z" fill="#149CC5"></path><path d="M1.69164 15.9667C1.69114 15.1961 1.76022 14.4271 1.89804 13.669H1.66727C1.31164 13.669 0.970593 13.8103 0.719137 14.0617C0.467681 14.3132 0.326416 14.6543 0.326416 15.0099V17.7249C0.326416 18.0034 0.437041 18.2704 0.633954 18.4674C0.830867 18.6643 1.09794 18.7749 1.37642 18.7749H2.02712C1.79945 17.8563 1.68676 16.913 1.69164 15.9667Z" fill="#69CAA4"></path><path d="M15 3.795C8.11089 3.795 2.52625 9.07732 2.52625 15.9664C2.52625 22.8556 8.11097 26.205 15 26.205C21.8891 26.205 27.4737 22.8558 27.4737 15.9667C27.4737 9.0777 21.8891 3.795 15 3.795ZM18.0265 21.1253H11.9735C11.1168 21.1265 10.2697 20.944 9.48954 20.59C8.92592 20.3341 7.28177 20.8716 6.82704 20.4631C6.27602 19.9681 6.94405 18.4942 6.6058 17.827C6.1792 16.9853 5.95758 16.0546 5.959 15.1109C5.959 13.5158 6.59265 11.9861 7.72055 10.8582C8.84845 9.73025 10.3782 9.0966 11.9733 9.0966H18.0263C19.6214 9.0966 21.1512 9.73025 22.2791 10.8582C23.407 11.9861 24.0407 13.5158 24.0407 15.1109C24.0407 15.9007 23.8852 16.6828 23.583 17.4126C23.2808 18.1423 22.8378 18.8053 22.2793 19.3638C21.7208 19.9223 21.0578 20.3654 20.3282 20.6677C19.5985 20.97 18.8164 21.1256 18.0266 21.1256L18.0265 21.1253Z" fill="url(#paint0_linear_477_9132)"></path><path d="M15 3.795C8.11089 3.795 2.52625 9.07732 2.52625 15.9664C2.52625 22.8556 8.11097 26.205 15 26.205C21.8891 26.205 27.4737 22.8558 27.4737 15.9667C27.4737 9.0777 21.8891 3.795 15 3.795ZM18.0265 21.1253H11.9735C11.1168 21.1265 10.2697 20.944 9.48954 20.59C8.92592 20.3341 7.28177 20.8716 6.82704 20.4631C6.27602 19.9681 6.94405 18.4942 6.6058 17.827C6.1792 16.9853 5.95758 16.0546 5.959 15.1109C5.959 13.5158 6.59265 11.9861 7.72055 10.8582C8.84845 9.73025 10.3782 9.0966 11.9733 9.0966H18.0263C19.6214 9.0966 21.1512 9.73025 22.2791 10.8582C23.407 11.9861 24.0407 13.5158 24.0407 15.1109C24.0407 15.9007 23.8852 16.6828 23.583 17.4126C23.2808 18.1423 22.8378 18.8053 22.2793 19.3638C21.7208 19.9223 21.0578 20.3654 20.3282 20.6677C19.5985 20.97 18.8164 21.1256 18.0266 21.1256L18.0265 21.1253Z" fill="url(#paint1_linear_477_9132)"></path><path d="M10.5456 14.915H8.76648V18.7946H10.5456V14.915Z" fill="#75CCCC"></path><path d="M14.1198 13.1932H12.3407V18.7946H14.1198V13.1932Z" fill="#75CCCC"></path><path d="M17.6939 15.4381H15.9148V18.7946H17.6939V15.4381Z" fill="#75CCCC"></path><path d="M21.2334 12.4522H19.4543V18.7946H21.2334V12.4522Z" fill="#75CCCC"></path><defs><linearGradient id="paint0_linear_477_9132" x1="6.6502" y1="4.44097" x2="25.0992" y2="29.2491" gradientUnits="userSpaceOnUse"><stop stop-color="#B2F288"></stop><stop offset="0.181" stop-color="#80D79C"></stop><stop offset="0.371" stop-color="#52BEAD"></stop><stop offset="0.554" stop-color="#2FAABB"></stop><stop offset="0.724" stop-color="#159CC5"></stop><stop offset="0.878" stop-color="#0594CB"></stop><stop offset="1" stop-color="#0091CD"></stop></linearGradient><linearGradient id="paint1_linear_477_9132" x1="6.6502" y1="4.44097" x2="25.0992" y2="29.2491" gradientUnits="userSpaceOnUse"><stop stop-color="#B2F288"></stop><stop offset="0.181" stop-color="#80D79C"></stop><stop offset="0.371" stop-color="#52BEAD"></stop><stop offset="0.554" stop-color="#2FAABB"></stop><stop offset="0.724" stop-color="#159CC5"></stop><stop offset="0.878" stop-color="#0594CB"></stop><stop offset="1" stop-color="#0091CD"></stop></linearGradient></defs></svg></i>
                    </div>
                    <!-- 这里去掉工作流和背景色显示，参考deepseek样式 -->
                    <!-- <div class="answer-content"
                        :style="{ backgroundColor: chat.status === 'error' ? 'rgba(255, 244, 244, 1)' : 'rgba(255, 255, 255, .6)' }"> -->
                    <div class="answer-content">
                        <!-- 工作流（折叠在同一个回答气泡里）chat.workflowSteps?.length -->
                        <div v-if="false" class="workflow-collapsible-card">
                            <div class="workflow-header" @click="toggleWorkflow(chatIndex)">
                                <div class="workflow-header-left">
                                    <!-- 显示loading状态 -->
                                    <span class="mr-1 relative top-[2px]">
                                        <el-icon v-if="chat.status === 'loading'" class="animate-spin">
                                            <Loading />
                                        </el-icon>
                                        <span v-else>
                                            <el-icon color="#079455" v-if="chat.status === 'success'">
                                                <SuccessFilled />
                                            </el-icon>
                                            <el-icon color="#f56c6c" v-if="chat.status === 'error'">
                                                <CircleCloseFilled />
                                            </el-icon>
                                        </span>
                                    </span>
                                    <span class="workflow-title">工作流</span>
                                    <span class="workflow-count">（{{ chat.workflowSteps.length }}步）</span>
                                </div>
                                <div class="workflow-header-right">
                                    <el-icon class="expand-icon" :class="{ expanded: isExpanded(chatIndex) }">
                                        <ArrowDown />
                                    </el-icon>
                                </div>
                            </div>

                            <div v-show="isExpanded(chatIndex)" class="workflow-content">
                                <ul class="workflow-steps-list">
                                    <li v-for="(step, idx) in chat.workflowSteps" :key="idx">
                                        <div class="workflow-step-card">
                                            <div class="step-title">
                                                <div class="divRedius"
                                                    :style="{ backgroundColor: getBackgroundColors(step.data?.node_type, idx) }">
                                                    <i class="defined" :style="{
                                                        backgroundImage: `url(${modelIcon(step.data?.node_type, idx)})`,
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                    }" />
                                                </div>
                                                <span>{{ step.data?.title }}</span>
                                            </div>
                                            <div class="step-time" v-if="step.status === 'success'">
                                                {{ convertTime(step.elapsed_time ?? step.data?.elapsed_time ?? 0) }}
                                            </div>
                                            <div class="step-time" v-else-if="step.status === 'loading'">Running...
                                            </div>
                                            <div class="step-time" v-else-if="step.status === 'error'">执行失败</div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <!-- 报告专属 -->
                        <div v-if="chat.isReportParams && chat.parsedContent?.length"
                            class="flex items-center flex-wrap">
                            <div class="mr-1.5 mt-1.5 inline-flex max-w-full text-[#155aef] font-bold shrink-0 cursor-pointer flex-wrap rounded-lg border-[0.5px] border-[#10182824] bg-components-button-secondary-bg px-3 py-1.5 text-components-button-secondary-accent-text shadow-xs last:mr-0 hover:border-components-button-secondary-border-hover hover:bg-[#f9fafb]"
                                v-for="item in chat.parsedContent" :key="item.id" @click="sendQuestion({
                                    question: item.name,
                                    inputs: {
                                        plan_id: item.id,
                                        plan_name: item.name,
                                    }
                                })">
                                {{ item.name }}
                            </div>
                        </div>

                        <!-- 空结果 -->
                        <div v-if="chat.isEmpty" class="empty-text">未查询到相关的数据，请重试。</div>

                        <!-- 文本流：这里会兼容多种情况 -->
                        <!-- messageLoading:消息开始读取，loading: 整个流程加载中 -->
                        <ChatAnswer :appType="config.appType" :messageLoading="chat.messageLoading"
                            :content="chat.answer" :loading="chat.status === 'loading'" :seconds="chat.seconds"
                            :message-end="chat.messageEnd" :thinkAbount="chat.thinkAbount" :message-id="chat.id" />
                        <!-- 工具栏：复制，分享，下载， 目前暂不支持分享 -->
                        <ChatAnswerToolbar v-if="chat.messageEnd" :chat-id="chat.id" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch, computed } from 'vue';
import { ArrowDown, Tickets, Loading, SuccessFilled, CircleCloseFilled } from '@element-plus/icons-vue';
import { ListIcon, SparklesIcon } from '@/libs/Icons';
import { useChat } from '../composables/useChatSessionContext';
import { useChatSession } from '../composables/useChatMessageContext';
import { modelIcon, getBackgroundColors } from '@/utils/modelIcon.js';
import ChatAnswer from './ChatAnswer.vue';
import ChatAnswerToolbar from './ChatAnswerToolbar.vue';


const { config, isSidebarOpen, getColorClass, activeConversationId, conversationsParameters } = useChat();
const { chatHistory, sendQuestion, toggleWorkflow, workflowExpanded } = useChatSession();

const isExpanded = (chatIndex: number, answerIndex?: number) => {
    const key = answerIndex !== undefined ? `${chatIndex}-${answerIndex}` : `${chatIndex}`;
    return !!workflowExpanded.value[key];
};



const convertTime = (seconds = 0) => {
    if (seconds < 1) return `${(seconds * 1000).toFixed(2)}ms`;
    if (seconds >= 60) return `${(seconds / 60).toFixed(2)}min`;
    return `${seconds.toFixed(2)}s`;
};

</script>

<style scoped lang="scss">
.chat-history {
    height: 100%;
    overflow: auto;
    .item-as{
        border-radius: 16px;
        min-height: 48px;
        line-height: 24px;
        font-size: 16px;
        padding: 12px 16px;
        color: #1f2329;
        background: #f5f6f7;
        position: relative;
        word-wrap: break-word;
        white-space: pre-wrap;
    }
}

.chat-item {
    padding: 12px 0;
}

.question-bubble {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10px;
}

.question-bubble .txt {
    max-width: 70%;
    padding: 10px 12px;
    border-radius: 10px;
    background: #335cf9;
    color: #fff;
    line-height: 1.5;
}

.answer-bubble {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
    font-size: 14px;

    .answer-content {
        flex: 1;
        border-radius: 12px;
        /* padding: 12px; */
        display: flex;
        gap: 8px;
        min-width: 0;
        flex-direction: column;
        /* background-color: rgba(255, 255, 255, .6); */
    }
}

.workflow-collapsible-card {
    border: 1px solid rgba(233, 235, 247, 1);
    border-radius: 10px;
    overflow: hidden;
    font-size: 14px;
    width: 100%;
}

.workflow-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    cursor: pointer;
    background-color: rgba(255, 255, 255, .6);
}

.workflow-title {
    font-weight: 600;
    color: #091e40;
}

.workflow-count {
    margin-left: 6px;
    color: #7b879f;
    font-size: 12px;
}

.expand-icon {
    transition: transform 0.2s ease;
}

.expand-icon.expanded {
    transform: rotate(180deg);
}

.workflow-content {
    padding: 8px 12px 12px;
    background-color: rgba(255, 255, 255, .6);
}

.workflow-steps-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.workflow-step-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(234, 235, 236, 1);
}

.workflow-step-card:last-child {
    border-bottom: none;
}

.step-title {
    display: flex;
    align-items: center;
    gap: 10px;
}

.divRedius {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.defined {
    width: 18px;
    height: 18px;
    display: inline-block;
}

.step-time {
    font-size: 12px;
    color: #7b879f;
}

.resource-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 8px;
}

.resource-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    border-radius: 10px;
    background: rgba(242, 243, 248, 1);
    cursor: pointer;
}

.resource-name {
    color: #091e40;
    font-size: 13px;
}

.empty-text {
    color: #7b879f;
    font-size: 13px;
    padding: 6px 0;
}

.report-list {
    margin-top: 12px;
}

.report-item {
    border-top: 1px dashed rgba(233, 235, 247, 1);
    padding-top: 12px;
    margin-top: 12px;
}

.report-title {
    font-weight: 600;
    color: #091e40;
    margin-bottom: 10px;
}

.report-content {
    padding: 8px 0 0;
}

.response-loading {
    padding: 12px;
}

.loading-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #335cf9;
    margin-right: 6px;
    animation: blink 1.2s infinite ease-in-out;
}

.loading-dot:nth-child(2) {
    animation-delay: 0.2s;
}

.loading-dot:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes blink {

    0%,
    80%,
    100% {
        opacity: 0.2;
    }

    40% {
        opacity: 1;
    }
}
</style>