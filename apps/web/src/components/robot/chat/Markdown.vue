<template>
  <div class="markdown-content">
    <div v-html="renderedMarkdown"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
// @ts-ignore
import MarkdownIt from 'markdown-it';
import { isObjectLike } from '../utils/common';

const props = defineProps({
  value: {
    type: String,
    default: ''
  },
  allowVoice: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:value']);

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});
// 备份默认的 link_open 渲染函数
const defaultRender = md.renderer.rules.link_open || function (tokens: any, idx: number, options: any, env: any, self: any) {
  return self.renderToken(tokens, idx, options);
};

// 覆盖 link_open 规则
md.renderer.rules.link_open = function (tokens: any, idx: number, options: any, env: any, self: any) {
  // 检查是否已经存在 target 属性，防止重复添加
  const targetIndex = tokens[idx].attrIndex('target');
  if (targetIndex === -1) {
    // 添加 target="_blank"
    tokens[idx].attrPush(['target', '_blank']);
    // 添加 rel="noopener noreferrer" 保证安全
    tokens[idx].attrPush(['rel', 'noopener noreferrer']);
  }
  // 调用默认渲染逻辑
  return defaultRender(tokens, idx, options, env, self);
};
const processContent = (content: string) => {
  if (!content) return '';

  // 处理多个思考标签
  return content
    .replace(/<think>/g, '<div class="think-content">')
    .replace(/<\/think>/g, '</div>');
};

function objectToMarkdownTable(obj: any): string {
  const header = '| 名称 | 内容 |\n| --- | --- |\n';
  const rows = Object.entries(obj)
    .map(([key, value]) => `| ${key} | ${value} |`)
    .join('\n');
  return header + rows;
}
// 已废弃（后端直接返回md链接）
const replaceCitationBrackets = (text: string) => {
  console.log('props.context', props.context);
  const citations = props.context?.citations ?? [];
  if (citations.length === 0) {
    return text;
  }
  const rge = /\[\[citation:(\d+)\]\]/g;
  return text.replace(rge, (match, p1) => {
    const targetCitation = citations.find((citation: any) => citation.single_ref === match);
    if (!targetCitation) {
      return match;
    }
    return `[此链接](${targetCitation.document_link})`;
  });
}
const renderedMarkdown = computed(() => {
  let contentToRender = props.value ? processContent(props.value) : '';

  try {
    if (props.allowVoice && isObjectLike(contentToRender)) {
      // console.log('contentToRender', contentToRender);
      let obj = JSON.parse(contentToRender)
      contentToRender = objectToMarkdownTable(obj);
    }
  } catch (error) {
    console.log('error', error);
  }
  // 如果含有上下文信息，进行部分替换
  return md.render(contentToRender);
});

</script>

<style>
.think-content {
  position: relative;
  padding: 0 0 0 13px;
  margin: 0;
  color: #8b8b8b;
  margin-bottom: 10px;
}

.think-content::before {
  position: absolute;
  top: 5px;
  left: 1px;
  width: 2px;
  height: calc(100% - 10px);
  content: ' ';
  background-color: #e5e5e5;
}
</style>

<style lang="less">
.markdown-content table {
  border-collapse: collapse;
  width: 100%;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid #cddcdd;
  padding: 6px 8px;
  text-align: left;
}

.markdown-content p {
  margin: 0;
}

.markdown-content ul {
  list-style: disc;
  padding-left: 1.25em;

  li {
    list-style: disc;
  }
}

.markdown-content ol {
  list-style: decimal;
  padding-left: 1.25em;

  li {
    list-style: decimal;
  }
}


.markdown-content code,
.markdown-content pre {
  word-break: break-all;
  white-space: pre-wrap;
}

/* 你原有的样式 */
.think-content {
  position: relative;
  padding: 0 0 0 13px;
  margin: 0;
  color: #8b8b8b;
  margin-bottom: 10px;
}

.think-content::before {
  position: absolute;
  top: 5px;
  left: 1px;
  width: 2px;
  height: calc(100% - 10px);
  content: ' ';
  background-color: #e5e5e5;
}
</style>