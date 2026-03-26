<template>
    <div class="flex flex-col">
        <div class="s-icon" v-if="loading && !content">
            <el-icon>
                <Search />
            </el-icon>
            <span class="pending-text">正在搜索
                <span class="dot">.</span>
                <span class="dot">.</span>
                <span class="dot">.</span>
            </span>
        </div>
        <template v-else>
            <div class="w-full">
                <div class="response-content markdown-body t1">
                    <div class="deep-think" v-if="thinkAbount">
                        <img :src="deepseekIcon" alt="" />
                        {{ messageLoading ? '思考中...' : '思考完成' }} <span v-if="seconds > 0">({{ seconds }}s)</span>
                        <span v-if="deepThinkContent" class="cursor-pointer flex items-center justify-center"
                            @click="handleThink">
                            <el-icon v-if="think">
                                <ArrowDown />
                            </el-icon>
                            <el-icon v-if="!think">
                                <ArrowUp />
                            </el-icon>
                        </span>

                    </div>
                    <div class="think-about" v-if="think" v-html="renderMarkdown(deepThinkContent)"></div>
                    <div ref="contentContainer">
                        <div v-if="jsonData.content || contentInfo" v-html="renderMarkdown(jsonData.content || contentInfo)">
                        </div>
                        <!-- 处理一些错误显示 -->
                        <div v-if="jsonData.result">
                            <div class="text-red-500" v-if="jsonData?.status === 'error'"
                                v-html="renderMarkdown(JSON.stringify(jsonData?.result[0]).slice(1, -1))"></div>
                            <!-- 自定义渲染 -->
                            <template v-if="jsonData?.result?.length > 0">
                                <table v-for="(v, i) in jsonData?.result" :key="i" style="width: 100%;">
                                    <tbody>
                                        <tr v-for="(value, key) in v" :key="key" :label="key">
                                            <td class="bg-[#f5f7fa] w-[20%]">{{ key }}</td>
                                            <td class="w-[80%]">{{ value }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </template>
                        </div>
                    </div>
                    <table v-if="jsonData.table?.length > 0" style="width: 100%;">
                        <thead>
                            <tr>
                                <th class="w-[60%]">资源名称</th>
                                <th class="w-[40%]">匹配度</th>
                                <!-- <th class="w20">操作</th>-->
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in jsonData.table" :key="index">
                                <td >{{ item.resourceName }}</td>
                                <td >{{ item.score }}%</td>
                                <!-- <td>
                      <el-button type="primary" @click="handleView(item)"
                        >申请</el-button
                      >
                    </td>-->
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- <img v-if="loading" src="../../assets/img/loading.svg" class="loading-icon" alt="" /> -->
            </div>
        </template>
    </div>
    <!-- 添加弹层 -->
    <!-- <el-dialog v-model="dialogVisible" title="资源申请" width="75%">
        <div class="resource-request">
            <ResourceRequest :currentItemId="currentItemId" @close="handleClose" />
        </div>
    </el-dialog> -->
</template>
<script setup lang="ts">
import { ref, watch, nextTick, createApp } from "vue";
import deepseekIcon from "@/assets/img/intelligentService/thinking.svg";
import { isJSON } from "@/utils/tools";
import { renderMarkdown } from '@/utils/markdownRenderer.js';
import ChartRenderer from "@/views/intelligentService/ChartRenderer.vue";
import { useChatSession } from '../composables/useChatMessageContext';
// import ResourceRequest from "./resourceRequest.vue";
const props = defineProps({
    messageId: {
        type: String,
        default: "",
    },
    content: {
        type: String,
        default: "",
    },
    // chatHistorys: {
    //     type: Array,
    //     default: () => [],
    // },
    messageEnd: {
        type: Boolean,
        default: false,
    },
    appType: {
        type: String,
        default: "1",
    },
    // 是否开启深度思考
    thinkAbount: {
        type: Boolean,
        default: false,
    },
    seconds: {
        type: Number,
        default: 0,
    },
    messageLoading: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
});
// const intelligenceType = ref(sessionStorage.getItem("intelligenceType"));
// const questionNames = ref(props?.questionName);
const contentContainer = ref<HTMLElement | null>(null);
const { registerAnswerContainer } = useChatSession();
const dataList = ref([]); // 存储所有历史数据
const currentIndex = ref(0); // 当前显示的数据索引
const think = ref(props.thinkAbount);
const jsonData = ref({
    content: "",
    table: [],
    result: [],
    status: "",
});
const toptabList = ref([
    {
        name: "实时跟随",
        value: "1",
    },
    {
        name: "文件",
        value: "3",
    },
]);
const activeTab = ref("1");
const fileName = ref("数据编目");
const typesList = ref([
    {
        name: "代码",
        value: "1",
    },
    {
        name: "预览",
        value: "2",
    },
]);
const activeType = ref("1");
const fileList = ref([]);
const handleThink = () => {
    think.value = !think.value;
};
const handleTabs = (item) => {
    activeTab.value = item.value;
};
const handleTypes = (item) => {
    activeType.value = item.value;
};
// 清除上一次查询的记录
const clearData1 = () => {
    contentInfo.value = "";
    jsonData.value.content = "";
    jsonData.value.table = [];
};
const getTypeicon = (type) => {
    switch (type) {
        case "1":
            return "icon-code";
        case "2":
            return "icon-preview";
        case "3":
            return "icon-file";
        case "4":
            return "icon-pdf";
    }
};
const contentInfo = ref("");
const deepThinkContent = ref("");   // 深度思考内容
const parsedContent = ref([]);
const hasTableJson = (str) => {
    try {
        const parsed = JSON.parse(str);
        return Array.isArray(parsed.table);
    } catch (e) {
        return false;
    }
};
// 处理接收到的数据，提取各部分内容
const processReceivedData = (text) => {
    // 提取<think>标签内容
    const thinkStart = text.indexOf("<think>");
    const thinkEnd = text.indexOf("</think>");
    if (thinkStart > 0 || thinkEnd > 0) {
        deepThinkContent.value = text.substring(thinkStart + 7, thinkEnd).trim();
    }
    const restText = text.replace(/<think>[\s\S]*?<\/think>/g, "");
    // 查找JSON部分的开始和结束位置
    const jsonStart = restText.indexOf("{");
    const jsonEnd = restText.lastIndexOf("}");

    // 如果还未接收到完整的JSON结构，只更新前缀部分
    if (jsonStart === -1 || jsonEnd === -1) {
        contentInfo.value = restText.trim();
        return;
    }

    // 提取前缀部分（JSON之前的内容）
    contentInfo.value = restText.substring(0, jsonStart).trim();

    try {
        // 提取并解析JSON部分
        const jsonStr = restText.substring(jsonStart, jsonEnd + 1);
        // 这里直接进行  单引号转换
        jsonData.value = JSON.parse(jsonStr.replace(/'/g, '"').replace(/\bNone\b/g, 'null')) // None → null);
    } catch (e) {
        console.error("JSON解析错误:", e);
    }
};
const handleParseNormalContent = (text) => {
    if (hasTableJson(text)) { // {content: string, table: any[]} 格式
        const parsed = JSON.parse(text);
        parsedContent.value = parsed.table;
        contentInfo.value = parsed.content;
    } else {
        processReceivedData(text);
    }
};
const renderCharts = () => {
    console.log(contentContainer.value);
    if (!contentContainer.value) return;
    const chartContainers =
        contentContainer.value.querySelectorAll(".chart-container");
    chartContainers.forEach((container, index) => {
        const chartData = (container as any).dataset.chart
            ? decodeURIComponent((container as any).dataset.chart)
            : null;
        // 创建一个占位div用于挂载Vue组件
        const placeholder = document.createElement("div");
        placeholder.className = "my-echarts";
        container.replaceWith(placeholder);

        // 使用Vue渲染图表组件
        const app = createApp(ChartRenderer, {
            chartData,
            chartId: `chart-${index}`,
        });
        app.mount(placeholder);
    });
};
const handleParseReportContent = (text) => {
    if (isJSON(text)) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed?.[0]?.result) && parsed?.[0]?.result?.length === 0) {
            contentInfo.value = '未查询到相匹配的资源，请你更换关键词后重新查询';
        }
    } else {
        // 第一部分：提取<think>标签内容
        const thinkStart = text.indexOf("<think>");
        const thinkEnd = text.indexOf("</think>");
        if (thinkStart > 0 || thinkEnd > 0) {
            deepThinkContent.value = text.substring(thinkStart + 7, thinkEnd).trim();
            return;
        }
        // 去掉<think>标签内容
        contentInfo.value = text.replace(/<think>[\s\S]*?<\/think>/g, "");
    }
};
watch(
    () => props?.content,
    (newVal) => {
        if (newVal) {
            // 先去掉问题的no-think标签
            console.log(newVal);
            const content = newVal.replace('/no_think', '');
            // dataList.value.push(newVal);
            // currentIndex.value = dataList.value.length - 1; // 默认显示最新数据
            // 根据appType解析内容
            if (props.appType === '2') { // 报告解析
                handleParseReportContent(content);
            } else {
                handleParseNormalContent(content);
            }
        }
    },
    { immediate: true }
);
watch(
    () => props?.messageEnd,
    async (newVal) => {
        if (newVal) { // 结束的时候渲染图表
            await nextTick();
            renderCharts();
            // 注册答案容器
            registerAnswerContainer(props.messageId, contentContainer.value);
        }
    },
    { immediate: true }
);
// watch(
//     () => props?.chatHistorys,
//     (newVal) => {
//         if (newVal) {
//             fileList.value = newVal;
//         }
//     },
//     { immediate: true }
// );
// 显示指定索引的数据
// const showDataByIndex = (index, list) => {
//     console.log(index, list);
//     if (index >= 0 && index < list.length) {
//         currentIndex.value = index;
//         const data = list[index].answer;
//         questionNames.value = list[index]?.question;
//         if (hasTableJson(data)) {
//             const parsed = JSON.parse(data);
//             parsedContent.value = parsed.table;
//             contentInfo.value = parsed.content;
//         } else {
//             processReceivedData(data);
//         }
//     }
// };

// const handleInfo = (item) => {
//     console.log(item);
//     questionNames.value = item.question;
//     const data = item?.answer;
//     if (hasTableJson(data)) {
//         const parsed = JSON.parse(data);
//         parsedContent.value = parsed.table;
//         contentInfo.value = parsed.content;
//     } else {
//         processReceivedData(data);
//     }
//     activeTab.value = "1";
// };
// const checkResourceApp = async (id) => {
//     let params = {
//         access_token: sessionStorage.getItem("dataPortalToken"),
//         rid: id,
//     };
//     const result = await resourceRequestAPi.checkResourceApply(params);
//     if (result.code == 0) {
//         if (result.data.isApply === true) {
//             ElMessage.success("该资源已申请");
//         } else {
//             dialogVisible.value = true;
//         }
//     } else {
//         ElMessage.error(result.msg);
//     }
// };
// const getResourceDetailInfo = async (id) => {
//     let params = {
//         access_token: sessionStorage.getItem("dataPortalToken"),
//         id: id,
//     };
//     const result = await resourceRequestAPi.getResourceDetail(params);
//     if (result.code == 0) {
//         sessionStorage.setItem(
//             "catalogId",
//             result?.data?.resourceDataPublish?.catalogId || ""
//         );
//     }
// };

const dialogVisible = ref(false);
const currentItem = ref(null);
const currentItemId = ref("");

// const handleView = async (item) => {
//     currentItem.value = item;
//     currentItemId.value = item.pkId;
//     await getResourceDetailInfo("7e45b939d07e4b54a220762a309e9f74");
//     await checkResourceApp("591676ea65094db684a850d02fc8bbd0" || item.pkId);
// };
const clearData = () => {
    dataList.value = [];
    contentInfo.value = "";
    parsedContent.value = [];
    currentIndex.value = 0;
};

const handleBack = () => {
    activeTab.value = "3";
};
const handleClose = () => {
    dialogVisible.value = false;
};

// 暴露方法给父组件
defineExpose({
    clearData,
    clearData1,
});
</script>
<style lang="scss">
/* ✅ 平滑的逆时针圆形轨迹动画（小幅度） */
@keyframes orbit {
    0% {
        transform: translate(0, -2px);
        /* 正上方 12点 */
    }

    12.5% {
        transform: translate(-1.4px, -1.4px);
        /* 左上 10点半 */
    }

    25% {
        transform: translate(-2px, 0);
        /* 正左 9点 */
    }

    37.5% {
        transform: translate(-1.4px, 1.4px);
        /* 左下 7点半 */
    }

    50% {
        transform: translate(0, 2px);
        /* 正下 6点 */
    }

    62.5% {
        transform: translate(1.4px, 1.4px);
        /* 右下 4点半 */
    }

    75% {
        transform: translate(2px, 0);
        /* 正右 3点 */
    }

    87.5% {
        transform: translate(1.4px, -1.4px);
        /* 右上 1点半 */
    }

    100% {
        transform: translate(0, -2px);
        /* 回到正上方 12点 */
    }
}
</style>
<style lang="scss" scoped>
.answer-wrapper {
    height: 100%;
    box-sizing: border-box;

    .topTabList {
        display: flex;
        align-items: center;

        li {
            font-size: 0.35rem;
            color: rgba(128, 128, 128, 1);
            padding: 0.2rem 0.4rem;
            border-radius: 0.5rem;
            cursor: pointer;

            &.active {
                background: rgba(242, 243, 248, 1);
                color: rgba(56, 56, 56, 1);
            }
        }
    }

    .typesContent1 {
        // height: 100%;
        height: calc(100% - 0.925rem);

        .typeFilecon {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 0.2rem;

            .leftArrow {
                width: 0.4rem;
                height: 0.4rem;
                background: url(../../assets/img/intelligentService/right-icon1.png);
                margin-right: 0.15rem;
            }

            p {
                display: flex;
                align-items: center;
                flex-shrink: 0;
                width: calc(100% - 5.75rem);
                font-size: 0.35rem;
                color: rgba(56, 56, 56, 1);
            }

            span {
                max-width: calc(100% - 50px);
                font-size: 0.35rem;
                color: rgba(56, 56, 56, 1);
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            ul {
                display: flex;
                border-radius: 0.5rem;
                background: rgba(242, 243, 248, 1);
                padding: 0.15rem 0;

                li {
                    padding: 0 0.25rem;
                    font-size: 0.3rem;
                    color: rgba(128, 128, 128, 1);
                    cursor: pointer;

                    &:first-child {
                        position: relative;

                        &::after {
                            content: "";
                            position: absolute;
                            top: 50%;
                            right: 0;
                            width: 0.025rem;
                            height: 0.35rem;
                            background: rgba(166, 166, 166, 1);
                            transform: translateY(-50%);
                        }
                    }

                    &.active {
                        color: rgba(34, 95, 229, 1);
                        font-weight: 500;
                    }
                }
            }

            .download-icon {
                width: 0.4rem;
                height: 0.4rem;
                background: url(../../assets/img/intelligentService/right-icon2.png);
                background-size: 100% 100%;
                background-repeat: no-repeat;
                margin-right: 0.15rem;
            }

            .editor-icon {
                width: 0.35rem;
                height: 0.35rem;
                background: url(../../assets/img/intelligentService/right-icon3.png);
                background-size: 100% 100%;
                background-repeat: no-repeat;
                margin-right: 0.15rem;
            }

            .full-icon {
                width: 0.4rem;
                height: 0.4rem;
                background: url(../../assets/img/intelligentService/right-icon4.png);
                background-size: 100% 100%;
                background-repeat: no-repeat;
                margin-right: 0.15rem;
            }
        }

        .typeMain-con1 {
            h3 {
                font-size: 0.4rem;
                color: rgba(56, 56, 56, 1);
                font-weight: 700;
                margin-bottom: 0.3rem;
            }

            h4 {
                font-size: 0.35rem;
                color: rgba(56, 56, 56, 1);
                font-weight: 500;
                margin: 0.25rem 0;
            }

            p {
                font-size: 0.35rem;
                color: rgba(102, 103, 104, 1);
                margin-bottom: 0.25rem;
            }
        }

        .types-main {
            height: calc(100% - 0.75rem);
            overflow-y: auto;
        }

        .types-main::-webkit-scrollbar {
            display: none;
        }
    }

    .typeMain-con2 {
        li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.25rem 0;

            .left-main {
                display: flex;
                align-items: center;

                .search-icon {
                    width: 0.35rem;
                    height: 0.35rem;
                    background: url(../../assets/img/intelligentService/answer-icon3.png);
                    background-size: 100% 100%;
                    background-repeat: no-repeat;
                    margin-right: 0.2rem;
                }

                p {
                    font-size: 0.35rem;
                    color: rgba(9, 30, 64, 1);
                    margin-right: 0.2rem;
                }

                span {
                    font-size: 0.3rem;
                    color: rgba(9, 30, 64, 1);
                    background: rgba(233, 234, 240, 1);
                    padding: 0.15rem 0.25rem;
                    border-radius: 0.5rem;
                }
            }

            .right-main {
                font-size: 0.35rem;
                color: rgba(128, 128, 128, 1);
            }
        }
    }

    .typeMain-con3 {
        li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 0.35rem 0;
            cursor: pointer;

            .left-main {
                display: flex;
                align-items: center;

                .icon-code {
                    width: 0.35rem;
                    height: 0.35rem;
                    background: url(../../assets/img/intelligentService/file-icon1.png);
                    margin-right: 0.25rem;
                }

                .icon-preview {
                    width: 0.35rem;
                    height: 0.35rem;
                    background: url(../../assets/img/intelligentService/file-icon2.png);
                    margin-right: 0.25rem;
                }

                .icon-file {
                    width: 0.35rem;
                    height: 0.35rem;
                    background: url(../../assets/img/intelligentService/file-icon3.png);
                    margin-right: 0.25rem;
                    background-size: 100% 100%;
                    background-repeat: no-repeat;
                }

                .icon-pdf {
                    width: 0.35rem;
                    height: 0.35rem;
                    background: url(../../assets/img/intelligentService/file-icon4.png);
                    margin-right: 0.25rem;
                }

                p {
                    font-size: 0.35rem;
                    color: rgba(9, 30, 64, 1);
                }
            }

            .right-main {
                font-size: 0.35rem;
                color: rgba(128, 128, 128, 1);
            }
        }
    }

    .types-main {
        // background: rgba(250, 251, 255, 1);
        // box-shadow: inset 0px 1px 0px rgba(234, 235, 236, 1);
        padding: 0.3rem;
        border: 0.025rem solid rgba(234, 235, 236, 1);
        border-radius: 0.2rem;
        margin-top: 0.3rem;
    }
}

.loading-icon {
    width: 0.875rem;
    height: 0.875rem;
    animation: spin 1.5s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.response-content {
    color: rgb(51, 51, 51);
    font-size: 16px;

    .deep-think {
        display: flex;
        align-items: center;
        font-weight: 600;
        gap: 0.125rem;

        img {
            width: 0.5rem;
            height: 0.4rem;
            margin: 0.2rem 0;
        }
    }

    .think-about {
        padding: 0 0.25rem;
        border-left: 0.05rem solid #10182814;
        background: #f9fafb;
        margin-bottom: 0.25rem;
        color: rgb(97, 102, 107);
        font-size: 14px;
    }

    :deep(h1) {
        font-size: 0.6rem;
        font-weight: 600;
        margin: 0.6rem 0 0.4rem;
        padding-bottom: 0.2rem;
        border-bottom: 0.05rem solid #eaecef;
        color: #1a1a1a;
    }

    :deep(h2) {
        font-size: 0.5rem;
        font-weight: 600;
        margin: 0.5rem 0 0.35rem;
        color: #1a1a1a;
    }

    :deep(h3) {
        font-size: 0.45rem;
        font-weight: 600;
        margin: 0.4rem 0 0.3rem;
        color: #1a1a1a;
    }

    :deep(h4) {
        font-size: 0.4rem;
        font-weight: 600;
        margin: 0.35rem 0 0.25rem;
        color: #1a1a1a;
    }

    :deep(p) {
        margin: 0.1rem 0;
        line-height: 1.5;
    }

    :deep(ul),
    :deep(ol) {
        padding-left: 0.6rem;
        margin: 0.3rem 0;

        li {
            margin: 0.2rem 0;
            line-height: 1.6;

            // &::marker {
            //     color: #42b983;
            // }
        }
    }

    :deep(ul) {
        list-style-type: disc;
    }

    :deep(ol) {
        list-style-type: decimal;
    }

    :deep(pre) {
        background: #f8f9fa;
        padding: 0.4rem;
        border-radius: 0.2rem;
        overflow-x: auto;
        margin: 0.4rem 0;
        border: 0.025rem solid #eaecef;

        code {
            font-family: "Fira Code", "Consolas", monospace;
            font-size: 0.35rem;
            line-height: 1.6;
            color: #476582;
        }
    }

    :deep(code) {
        background: #f8f9fa;
        padding: 0.05rem 0.15rem;
        border-radius: 0.1rem;
        font-family: "Fira Code", "Consolas", monospace;
        font-size: 0.35rem;
        color: #476582;
    }

    :deep(blockquote) {
        margin: 0.4rem 0;
        padding: 0.3rem 0.4rem;
        border-left: 0.1rem solid #42b983;
        background: #f8f9fa;
        color: #666;

        p {
            margin: 0;
        }
    }

    :deep(table) {
        border-spacing: 0;
        border-collapse: collapse;
        // display: block;
        width: max-content;
        // max-width: 100%;
        overflow: auto;
        margin: 0.4rem 0;
        
        // border: 0.025rem solid #eaecef;
        // border-radius: 0.2rem;
        overflow: auto;

        thead {
            background: #f8f9fa;
            // border-bottom: 0.05rem solid #eaecef;
        }

        tbody {
            background: #fff;
        }

        th,
        td {
            padding: 0.3rem 0.4rem;
            border: 1px solid #eaecef;
            text-align: left;
            min-width: 3rem;
            // max-width: 7.5rem;
            // white-space: nowrap; // 这里表格允许换行
            // overflow: hidden;
            // text-overflow: ellipsis;
            vertical-align: middle;
        }

        th {
            font-weight: 600;
            color: #1a1a1a;
            background: #f8f9fa;
            position: sticky;
            top: 0;
            z-index: 1;
            box-shadow: 0 0.025rem 0 #eaecef;
        }

        tr {
            // &:nth-child(even) {
            //     background: #f8f9fa;
            // }

            // &:hover {
            //     background: #f1f3f5;

            //     td {
            //         position: relative;

            //         &::after {
            //             content: attr(data-content);
            //             position: absolute;
            //             left: 0;
            //             top: 100%;
            //             background: #fff;
            //             padding: 0.2rem;
            //             border-radius: 0.1rem;
            //             box-shadow: 0 0.05rem 0.2rem rgba(0, 0, 0, 0.1);
            //             z-index: 2;
            //             white-space: normal;
            //             max-width: 7.5rem;
            //             display: none;
            //         }

            //         &:hover::after {
            //             display: block;
            //         }
            //     }
            // }
        }
    }

    // :deep(img) {
    //     max-width: 100%;
    //     border-radius: 0.2rem;
    //     margin: 0.4rem 0;
    //     box-shadow: 0 0.05rem 0.2rem rgba(0, 0, 0, 0.1);
    // }

    :deep(a) {
        color: #42b983;
        text-decoration: none;
        transition: color 0.3s;

        &:hover {
            color: #3aa876;
            text-decoration: underline;
        }
    }

    :deep(hr) {
        margin: 0.6rem 0;
        border: none;
        border-top: 0.05rem solid #eaecef;
    }

    :deep(details) {
        margin: 0.4rem 0;
        padding: 0.3rem;
        background: #f8f9fa;
        border-radius: 0.2rem;

        summary {
            cursor: pointer;
            font-weight: 600;
            color: #1a1a1a;

            &:hover {
                color: #42b983;
            }
        }

        &[open] summary {
            margin-bottom: 12px;
        }
    }

    :deep(kbd) {
        background: #f8f9fa;
        border: 0.025rem solid #eaecef;
        border-radius: 0.1rem;
        padding: 0.05rem 0.15rem;
        font-family: "Fira Code", "Consolas", monospace;
        font-size: 0.35rem;
        color: #476582;
    }

    :deep(strong) {
        font-weight: 600;
        color: #1a1a1a;
    }

    :deep(em) {
        font-style: italic;
        color: #666;
    }

    :deep(del) {
        text-decoration: line-through;
        color: #999;
    }

    :deep(mark) {
        background: #fff8e1;
        padding: 0.05rem 0.1rem;
        border-radius: 0.1rem;
        color: #1a1a1a;
    }
}

.json-table {
    width: 100%;
    overflow-x: auto;

    table {
        border-spacing: 0;
        border-collapse: separate;
        width: 100%;
        margin: 0.4rem 0;
        // border: 1px solid #eaecef;
        border-radius: 0.2rem;
        overflow: auto;

        .w60 {
            width: 60%;
        }

        .w20 {
            width: 40%;
            text-align: center;
        }

        thead {
            background: #f8f9fa;
            // border-bottom: 0.05rem solid #eaecef;
        }

        tbody {
            background: #fff;
        }

        th,
        td {
            padding: 0.25rem 0.4rem;
            border: 0.025rem solid #eaecef;
            text-align: left;
            // min-width: 120px;
            max-width: 10rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            vertical-align: middle;
            font-size: 0.3rem;
        }

        th {
            font-weight: 600;
            color: #1a1a1a;
            background: #f8f9fa;
            position: sticky;
            top: 0;
            z-index: 1;
            box-shadow: 0 0.025rem 0 #eaecef;
        }

        td {
            text-align: center;
        }

        td:first-child {
            text-align: left;
        }

        tr {
            &:nth-child(even) {
                background: #f8f9fa;
            }

            &:hover {
                background: #f1f3f5;

                td {
                    position: relative;

                    &::after {
                        content: attr(data-content);
                        position: absolute;
                        left: 0;
                        top: 100%;
                        background: #fff;
                        padding: 0.2rem;
                        border-radius: 0.1rem;
                        box-shadow: 0 0.05rem 0.2rem rgba(0, 0, 0, 0.1);
                        z-index: 2;
                        white-space: normal;
                        max-width: 300px;
                        display: none;
                    }

                    &:hover::after {
                        display: block;
                    }
                }
            }
        }
    }
}

.s-icon {
    color: rgba(32, 41, 69, 0.62);
    width: auto; // 保持自动宽度
    text-align: left;
    padding: 0.1rem 0;

    i,
    span {
        display: inline-block;
        vertical-align: middle;
    }

    i {
        font-size: 0.32rem;
        animation: orbit 1.2s linear infinite;
    }

    /* 循环省略号动画：三个点依次出现并循环 */
    .pending-text {
        display: inline-flex;
        align-items: center;
        font-size: 14px;
        margin-left: 5px;
    }

    .pending-text .dot {
        display: inline-block;
        width: 4px;
        margin-left: 2px;
        opacity: 0;
    }

    // 显示循环点位动画
    /* 需求：开始三点都隐藏 → 1 出现 → 2 出现 → 3 出现 → 都隐藏 → 循环 */
    .pending-text .dot:nth-of-type(1) {
        animation: dot1Cycle 1.5s infinite both;
    }

    .pending-text .dot:nth-of-type(2) {
        animation: dot2Cycle 1.5s infinite both;
    }

    .pending-text .dot:nth-of-type(3) {
        animation: dot3Cycle 1.5s infinite both;
    }

    @keyframes dot1Cycle {

        /* 开始隐藏 */
        0%,
        9% {
            opacity: 0;
        }

        /* dot1 出现并保持，直到统一隐藏阶段 */
        10%,
        90% {
            opacity: 1;
        }

        /* 统一隐藏 */
        91%,
        100% {
            opacity: 0;
        }
    }

    @keyframes dot2Cycle {

        0%,
        39% {
            opacity: 0;
        }

        40%,
        90% {
            opacity: 1;
        }

        91%,
        100% {
            opacity: 0;
        }
    }

    @keyframes dot3Cycle {

        0%,
        69% {
            opacity: 0;
        }

        70%,
        90% {
            opacity: 1;
        }

        91%,
        100% {
            opacity: 0;
        }
    }
}

.resource-request {
    height: calc(100vh - 6.25rem);
    overflow-y: auto;
}
</style>