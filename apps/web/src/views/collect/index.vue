<template>
  <a-flex vertical class="px-6 h-full">
    <a-flex justify="space-between" align="center" class="mt-6 h-[40px]">
      <h3 class="text-[18px] m-0 text-[var(--sd-text-primary)]">收藏</h3>
      <a-space :size="8">
        <FlexSearch placeholder="搜索" :expanded-width="240" @change="handleSearchChange" />
        <a-dropdown :trigger="['click']">
          <a-button type="text" class="shadow-btn-wrapper">
            <FilterOutlined />
          </a-button>
          <template #overlay>
            <a-menu :selected-keys="[filterKey]" class="min-w-[140px]" @click="handleFilterClick">
              <a-menu-item v-for="item in collectFilterOptions" :key="item.value">
                <a-flex align="center" gap="small">
                  <CheckOutlined
                    class="text-[12px]"
                    :class="filterKey === item.value ? 'opacity-100' : 'opacity-0'"
                  />
                  <span>{{ item.label }}</span>
                </a-flex>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-space>
    </a-flex>

    <div class="mt-6 mb-4">
      <div class="text-[15px] font-medium text-[var(--sd-text-primary)]">全部收藏</div>
      <div class="mt-1 text-xs text-[var(--sd-text-caption)]">{{ displayList.length }} 条内容</div>
    </div>

    <a-table
      row-key="id"
      class="collect-table flex-1"
      :columns="columns"
      :data-source="displayList"
      :loading="loading"
      :pagination="false"
      :show-header="true"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'name'">
          <a-space :size="10">
            <s-icon-font
              svg-sprite
              :type="getItemIcon(record)"
              class="shrink-0 w-[22px] h-[22px]"
            />
            <span
              class="text-[var(--sd-text-primary)] cursor-pointer hover:text-[var(--sd-link-color)]"
              @click="goItem(record)"
            >
              {{ getItemTitle(record) }}
            </span>
          </a-space>
        </template>
        <template v-else-if="column.dataIndex === 'belong'">
          <span class="text-[var(--sd-text-caption)]">
            <span>{{ record.team.name }}</span>
            <span class="mx-1">/</span>
            <span
              class="cursor-pointer hover:text-[var(--sd-link-color)]"
              @click.stop="goKnowledge(record)"
            >
              {{ record.knowledge.name }}
            </span>
          </span>
        </template>
        <template v-else-if="column.dataIndex === 'created_at'">
          <span class="text-[var(--sd-text-caption)]">
            {{ transformDatatimeToRecentText(record.created_at) }}
          </span>
        </template>
        <template v-else-if="column.dataIndex === 'action'">
          <StarFilled
            class="text-[18px] cursor-pointer"
            style="color: var(--sd-yellow-6)"
            @click="handleUncollect(record)"
          />
        </template>
      </template>
      <template #emptyText>
        <Empty0 class="py-16!" description="暂无收藏" />
      </template>
    </a-table>
  </a-flex>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { to } from 'await-to-js'
import { useDebounceFn } from '@vueuse/core'
import { CheckOutlined, FilterOutlined, StarFilled } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { TableColumnType } from 'ant-design-vue'
import { common as commonApi } from '@sk/api'
import {
  CollectResourceType,
  DocumentType,
  documentTypeOptions,
  type CollectListItem,
} from '@sk/types'
import { transformDatatimeToRecentText } from '@sk/utils'
import { Empty0 } from '#sk-web/components/global'

type CollectFilterKey = 'all' | 'knowledge' | 'word' | 'sheet'

const collectFilterOptions: { label: string; value: CollectFilterKey }[] = [
  { label: '所有收藏', value: 'all' },
  { label: '文档', value: 'word' },
  { label: '表格', value: 'sheet' },
  { label: '知识库', value: 'knowledge' },
]

const router = useRouter()

const filterKey = ref<CollectFilterKey>('all')
const keyword = ref('')
const list = ref<CollectListItem[]>([])
const loading = ref(false)

const columns: TableColumnType<CollectListItem>[] = [
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '归属',
    dataIndex: 'belong',
  },
  {
    title: '收藏时间',
    dataIndex: 'created_at',
    width: 180,
    sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    defaultSortOrder: 'descend',
  },
  {
    title: '',
    dataIndex: 'action',
    width: 48,
    align: 'right',
  },
]

const displayList = computed(() => {
  if (filterKey.value === 'word') {
    return list.value.filter((item) => item.document?.type === DocumentType.WORD)
  }
  if (filterKey.value === 'sheet') {
    return list.value.filter((item) => item.document?.type === DocumentType.SHEET)
  }
  return list.value
})

const getDocumentTypeIcon = (type: DocumentType) => {
  return documentTypeOptions.find((item) => item.value === type)?.icon ?? 'icon-document'
}

const getItemTitle = (item: CollectListItem) => {
  return item.document?.name ?? item.knowledge.name
}

const getItemIcon = (item: CollectListItem) => {
  if (item.resource_type === CollectResourceType.DOCUMENT && item.document) {
    return getDocumentTypeIcon(item.document.type)
  }
  return item.knowledge.icon?.startsWith('icon-') ? item.knowledge.icon : 'icon-book-0'
}

const goKnowledge = (item: CollectListItem) => {
  router.push(`/${item.team.slug}/knowledge/${item.knowledge.slug}`)
}

const goItem = (item: CollectListItem) => {
  if (item.resource_type === CollectResourceType.DOCUMENT && item.document) {
    router.push(
      `/${item.team.slug}/knowledge/${item.knowledge.slug}/document/${item.document.slug}`,
    )
    return
  }
  goKnowledge(item)
}

const buildQueryParams = () => {
  const params: { resource_type?: CollectResourceType; keyword?: string } = {}
  if (filterKey.value === 'knowledge') {
    params.resource_type = CollectResourceType.KNOWLEDGE
  } else if (filterKey.value === 'word' || filterKey.value === 'sheet') {
    params.resource_type = CollectResourceType.DOCUMENT
  }
  const trimmedKeyword = keyword.value.trim()
  if (trimmedKeyword) {
    params.keyword = trimmedKeyword
  }
  return params
}

const fetchList = async () => {
  loading.value = true
  const [error, res] = await to(commonApi.getCollectList(buildQueryParams()))
  loading.value = false
  if (!error) {
    list.value = res?.data ?? []
  }
}

const debouncedFetchList = useDebounceFn(fetchList, 300)

const handleSearchChange = (value: string) => {
  keyword.value = value
  debouncedFetchList()
}

const handleFilterClick = ({ key }: { key: string }) => {
  filterKey.value = key as CollectFilterKey
  fetchList()
}

const handleUncollect = async (item: CollectListItem) => {
  const [error] = await to(
    commonApi.removeCollect({
      identifier: item.identifier,
      resource_type: item.resource_type,
    }),
  )
  if (!error) {
    message.success('取消收藏成功')
    list.value = list.value.filter((row) => row.id !== item.id)
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style lang="less">

</style>
