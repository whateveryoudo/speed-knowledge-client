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