<template>
    <div class="chat-input-area-wrapper relative">
        <transition name="fade">
            <a-flex class="absolute top-[-30px] left-[50%] -translate-x-1/2" justify="center"
                v-if="showBackToLatestMessage">
                <a-button class="px-2 py-1 text-[12px] text-[var(--sd-grey-8)] no-hover" v-if="showBackToLatestMessage"
                    @click="handleBackToLatestMessage">
                    回到最新消息
                    <DoubleLeftOutlined class="transform rotate-270" />
                </a-button>
            </a-flex>
        </transition>
        <!-- 加工具条 -->
        <div class="tool-bar">
            <ASpace>
                <a-button type="text" @click="todo()"
                    class="shadow-btn-wrapper has-hover hover:opacity-90 transition-opacity">图文编辑</a-button>
                <a-button type="text" @click="todo()"
                    class="shadow-btn-wrapper has-hover hover:opacity-90 transition-opacity">文档</a-button>
            </ASpace>
            <a-tooltip v-if="isPending || isDoing" title="停止生成" placement="top">
                <a-button type="text"
                    class="shadow-btn-wrapper text-[var(--sd-link-color)]! bg-[var(--sd-bg-blue-1)]! has-hover hover:opacity-90 transition-opacity"
                    @click="cancelMessage">
                    <PauseCircleOutlined />
                </a-button>
            </a-tooltip>
        </div>
        <div :class="['ai-input', isFocused && 'active']">
            <div class="input-wrapper">
                <textarea ref="textAreaRef" v-model="inputMessage" placeholder="请输入你的要求" :maxlength="1000" :rows="3"
                    @keydown="onKeydown" @focus="isFocused = true" @blur="isFocused = false" />
            </div>
            <div class="trigger-wrapper">
                <ASpace class="ai-input-trigger">
                    <span class="limit">{{ inputMessage.length }}/1000</span>
                    <ASpin class="relative top-[1px]" size="small" v-if="isPending" />

                    <div v-else :class="['send-trigger', disabledSend && 'disabled']" @click="sendQuestion({
                        question: inputMessage,
                    })">
                        <img :src="disabledSend ? SendDisabledSvg : SendSvg" alt="" />
                    </div>
                </ASpace>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useChatMessage } from '../composables/useChatMessageContext';
import { message } from 'ant-design-vue';
import SendSvg from '#sk-web/assets/images/robot/send.svg';
import SendDisabledSvg from '#sk-web/assets/images/robot/send-disabled.svg';
import { PauseCircleOutlined, DoubleLeftOutlined } from '@ant-design/icons-vue';
const { sendQuestion, isPending, isDoing, handleBackToLatestMessage, disabledSend, inputMessage, cancelMessage, showBackToLatestMessage, toggleShowBackToLatestMessage } = useChatMessage();
const isFocused = ref(false);
const todo = () => {
    message.info('功能开发中...');
}
const onKeydown = (e: KeyboardEvent) => {
    if (e.key !== 'Enter') return;
    if(e.shiftKey) return;
    e.preventDefault();
    sendQuestion({
        question: inputMessage.value,
    });
}
</script>
<style scoped lang="less">
.chat-input-area-wrapper {
    .tool-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 0;
        margin: 0 16px;

        :deep(.ant-button) {
            font-size: 12px;
        }

        .opt-item {
            border-radius: 4px;
            border: 1px solid transparent;
            background-color: #f7f8fa;

            :deep(.ant-radio-wrapper) {
                font-size: 12px;
                margin-right: 0;

                .ant-radio {
                    margin-right: 5px;
                }

                span {
                    padding: 0;
                }
            }

            &:hover {
                border-color: var(--ant-colorPrimary);
            }

            &.selected {
                :deep(.ant-radio-wrapper) {
                    color: var(--ant-colorPrimary);
                }

                background: var(--ant-controlItemBgActive);
            }

            padding: 3px 10px;
        }
    }

    .ai-input {
        flex-shrink: 0;
        margin: 0 16px;
        border: 1px solid rgba(126, 134, 142, 0.16);
        background: #fff;
        border-radius: 6px;
        padding: 5px;
        flex-direction: column;
        display: flex;

        .input-wrapper {
            flex: 1;

            textarea {
                display: flex;
                box-sizing: border-box;
                border-radius: 6px;
                outline: none;
                border: none;
                height: 100%;
                padding: 5px;
                width: 100%;
                resize: none;
                background-color: transparent;
            }
        }

        .trigger-wrapper {
            flex: 0 0 35px;
            display: flex;
            justify-content: flex-end;

            .ai-input-trigger {
                flex-shrink: 0;

                .limit {
                    color: #a2a3a5;
                }

                .send-trigger {
                    cursor: pointer;

                    &.disabled {
                        cursor: not-allowed;
                    }
                }
            }
        }

        &:hover,
        &.active {
            border: 1px solid transparent;
            background-origin: padding-box, border-box;
            background-clip: padding-box, border-box;
            background-image: -webkit-gradient(linear, left top, right top, from(#fff), to(#fff)),
                conic-gradient(from 0deg,
                    #ffbaf6 0,
                    #b9adff 60deg,
                    #80bfff 120deg,
                    #adf7ff 180deg,
                    #e9ccff 240deg,
                    #ffc29c 300deg,
                    #ffbaf6 1turn);
            background-image: -webkit-linear-gradient(left, #fff, #fff),
                conic-gradient(from 0deg,
                    #ffbaf6 0,
                    #b9adff 60deg,
                    #80bfff 120deg,
                    #adf7ff 180deg,
                    #e9ccff 240deg,
                    #ffc29c 300deg,
                    #ffbaf6 1turn);
            background-image: linear-gradient(90deg, #fff, #fff),
                conic-gradient(from 0deg,
                    #ffbaf6 0,
                    #b9adff 60deg,
                    #80bfff 120deg,
                    #adf7ff 180deg,
                    #e9ccff 240deg,
                    #ffc29c 300deg,
                    #ffbaf6 1turn);
        }
    }

    .message-item-wrapper {
        margin-bottom: 20px;

        .avatar-wrapper {
            flex-shrink: 0;
        }

        .content-wrapper {
            flex: 1;
            min-width: 0;
            max-width: 320px;

            &.user {
                flex: initial;
            }

            .chat-user-prompt-wrapper {
                flex: initial;
                background-color: #c9e7ff;
                border-radius: 6px 2px 6px 6px;
                border: none;
                padding: 8px 12px;

                .chat-prompt-wrapper {
                    border: none;
                }
            }

            .chat-ai-prompt-wrapper {
                border-radius: 5px;
                overflow-x: auto;
                padding: 2px;

                .chat-ai-inner-wrapper {
                    border: 1px solid #e5e6e8;
                    background-color: #fff;
                    border-radius: 5px;
                    padding: 12px;
                }

                &.loading {
                    border-color: transparent;
                    animation: light-gradient-border-rotate 2.5s linear infinite;
                    color: rgba(23, 26, 29, 0.4);
                }
            }

            .chat-welcome-prompt-wrapper {
                border: 1px solid #e5e6e8;
                border-radius: 5px;
                padding: 12px;
                overflow-x: auto;

                :deep(.ant-divider) {
                    margin: 5px 0;
                }

                .welcome-prpmpt-list {
                    :deep(.ant-flex) {
                        font-size: 12px;

                    }

                    li {
                        padding: 7px 5px;
                        border-radius: 4px;
                    }

                    li:first-child {
                        margin-bottom: 10px;
                    }

                    li.select-able {
                        background-color: #edf3ff99;
                        transition: all .2s;
                        cursor: pointer;

                        &:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 3px rgba(0, 0, 0, 0.05);
                        }
                    }
                }

                // ul {
                //   padding-left: 18px;
                //   margin-top: 10px;
                //   li {
                //     list-style: disc;
                //     margin-bottom: 10px;
                //     cursor: pointer;
                //     color: var(--ant-colorPrimary);
                //   }
                // }
            }
        }
    }
}
</style>