<template>
  <a-flex vertical class="px-2 h-full">
    <div
      class="text-[var(--sd-text-body)] cursor-pointer flex items-center h-[32px] my-[4px] px-[8px] rounded-[6px] hover:bg-[var(--sd-bg-primary-hover)]"
      :class="{
        'bg-[var(--sd-bg-primary-hover)]': activeKey === '',
      }" @click="handleHomeClick()">
      <HomeOutlined class="mr-2" /> 首页
    </div>
    <!-- 目录 -->
    <div class="text-[var(--sd-text-body)] cursor-pointer flex items-center h-[32px] my-[4px] px-[2px] rounded-[6px]">
      <a-dropdown>
        <a-button type="text" class="shadow-btn-wrapper">
          <template #icon>
            <UnorderedListOutlined />
          </template>
          目录
        </a-button>
        <template #overlay>
          <a-menu>
            <a-menu-item key="1">
              1st menu item
            </a-menu-item>
            <a-menu-item key="2">
              2nd menu item
            </a-menu-item>
            <a-menu-item key="3">
              3rd item
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>

    <div class="flex-1 overflow-y-auto">
      <SkeletonList :loading="loading">
        <a-tree v-if="tree.length > 0" :selectedKeys="[activeKey]" :fieldNames="{ key: 'document_slug' }"
          :virtual="false" class="speed-knowledge-tree" blockNode draggable :tree-data="tree"
          @dragenter="onDragEnter" @drop="onDrop" @select="handleTreeSelect" />
        <Empty0 hasTop v-else description="暂无文档" />
      </SkeletonList>
    </div>
  </a-flex>

</template>
<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import type {
  AntTreeNodeDragEnterEvent,
  AntTreeNodeDropEvent,
  TreeProps,
} from 'ant-design-vue/es/tree';
import { useRoute, useRouter } from 'vue-router';
import { type DocumentNodeTreeItem } from '@sk/types';
const props = withDefaults(defineProps<{
  loading: boolean;
  tree: DocumentNodeTreeItem[];
}>(), {
  loading: false,
  tree: () => [],
})
const route = useRoute();
const router = useRouter();

const x = 3;
const y = 2;
const z = 1;
const genData = [];
const loading = ref(false)
const generateData = (_level: number, _preKey?: string, _tns?: TreeProps['treeData']) => {
  const preKey = _preKey || '0';
  const tns = _tns || genData;

  const children = [];
  for (let i = 0; i < x; i++) {
    const key = `${preKey}-${i}`;
    tns.push({ title: key, key });
    if (i < y) {
      children.push(key);
    }
  }
  if (_level < 0) {
    return tns;
  }
  const level = _level - 1;
  children.forEach((key, index) => {
    tns[index].children = [];
    return generateData(level, key, tns[index].children);
  });
};
generateData(z);
type TreeDataItem = TreeProps['treeData'][number];
const gData = ref<TreeProps['treeData']>(genData);
const onDragEnter = (info: AntTreeNodeDragEnterEvent) => {
  console.log(info);
  // expandedKeys 需要展开时
  // expandedKeys.value = info.expandedKeys;
};
const activeKey = computed(() => {
  return route.params.document_slug as string || '';
})
const onDrop = (info: AntTreeNodeDropEvent) => {
  console.log(info);
  const dropKey = info.node.key;
  const dragKey = info.dragNode.key;
  const dropPos = info.node.pos.split('-');
  const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
  const loop = (data: TreeProps['treeData'], key: string | number, callback: any) => {
    data.forEach((item, index) => {
      if (item.key === key) {
        return callback(item, index, data);
      }
      if (item.children) {
        return loop(item.children, key, callback);
      }
    });
  };
  const data = [...gData.value];

  // Find dragObject
  let dragObj: TreeDataItem;
  loop(data, dragKey, (item: TreeDataItem, index: number, arr: TreeProps['treeData']) => {
    arr.splice(index, 1);
    dragObj = item;
  });
  if (!info.dropToGap) {
    // Drop on the content
    loop(data, dropKey, (item: TreeDataItem) => {
      item.children = item.children || [];
      /// where to insert 示例添加到头部，可以是随意位置
      item.children.unshift(dragObj);
    });
  } else if (
    (info.node.children || []).length > 0 && // Has children
    info.node.expanded && // Is expanded
    dropPosition === 1 // On the bottom gap
  ) {
    loop(data, dropKey, (item: TreeDataItem) => {
      item.children = item.children || [];
      // where to insert 示例添加到头部，可以是随意位置
      item.children.unshift(dragObj);
    });
  } else {
    let ar: TreeProps['treeData'] = [];
    let i = 0;
    loop(data, dropKey, (_item: TreeDataItem, index: number, arr: TreeProps['treeData']) => {
      ar = arr;
      i = index;
    });
    if (dropPosition === -1) {
      ar.splice(i, 0, dragObj);
    } else {
      ar.splice(i + 1, 0, dragObj);
    }
  }
  gData.value = data;
};
const handleHomeClick = () => {
  router.push(`/knowledge/${route.params.slug}`);
}

const handleTreeSelect = (_: any, e: { selected: boolean; node: any }) => {
  console.log(e.node);
  if (e.node.document_slug) {
    router.push(`/knowledge/${route.params.slug}/document/${e.node.document_slug}`);
  }
}

</script>
<style lang="less">
@tree-line-height: 32px;

.speed-knowledge-tree.ant-tree {
  background: transparent;

  .ant-tree-switcher {
    margin-top: 4px;
    align-self: auto;
    transition: all 0.1s;
    border-radius: 4px;

    &:hover {
      color: var(--sd-text-grey-900);
      background-color: var(--sd-grey-5);
    }
  }

  // 移除默认的选中样式
  .ant-tree-node-content-wrapper.ant-tree-node-selected,
  .ant-tree-checkbox+span.ant-tree-node-selected {
    background-color: transparent;
  }

  // .ant-tree-node-content-wrapper .ant-tree-switcher {
  // }

  .ant-tree-node-content-wrapper {
    line-height: @tree-line-height;

    &:hover {
      background-color: transparent;
    }
  }

  .ant-tree-treenode {
    padding-bottom: 0;
    margin-bottom: 4px;
    border-radius: 6px;
    padding-left: 2px;

    &:hover,
    &.ant-tree-treenode-selected {
      background-color: var(--sd-bg-primary-hover);
    }
  }
}
</style>
<style lang="less" scoped></style>
