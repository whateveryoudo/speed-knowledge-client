<template>
  <div class="flex flex-col h-full bg-white">
    <!-- 顶部主标题 (独占一行) -->
    <h2 class="text-[18px] font-semibold text-gray-900 m-0 mb-4 shrink-0">通讯录</h2>

    <!-- Tab 栏与操作栏 (独占一行：左侧 a-segmented 分段控制器，右侧导出与添加成员) -->
    <div class="flex items-center justify-between pb-4 shrink-0">
      <div class="w-fit">
        <a-segmented v-model:value="activeTab" :options="tabOptions" @change="switchTab" />
      </div>

      <!-- 右侧操作栏 (导出与添加成员) -->
      <div class="flex items-center gap-3">
        <a-button class="rounded-[6px]" @click="handleExport">导出</a-button>
        <a-button type="primary" class="rounded-[6px] !bg-[#00b96b] !border-[#00b96b] hover:!bg-[#059669]"
          @click="showAddMemberModal = true">
          <template #icon>
            <PlusOutlined />
          </template>
          添加成员
        </a-button>
      </div>
    </div>

    <!-- 主体左右分栏 (带外层边框与圆角卡片) -->
    <div
      class="flex-1 min-h-0 flex border border-solid border-[var(--sd-border-primary)] rounded-[8px] overflow-hidden bg-white">
      <!-- 左栏：部门树 (内含细分隔线) -->
      <DepartmentTree :tree-data="departmentTree" :selected-id="selectedDeptId" @select="onSelectDepartment"
        @add-sub="onAddSubDepartment" @edit="onEditDepartment" @delete="onDeleteDepartment" />

      <!-- 右栏：人员列表区域 -->
      <div class="flex-1 flex flex-col min-w-0 h-full p-5 overflow-hidden">
        <!-- 列表头部：部门名称与直属成员开关 -->
        <div class="pb-3 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2">
            <span class="text-[16px] font-medium text-gray-900">
              {{ currentDeptName || '全部成员' }}
            </span>
            <span class="inline-flex items-center gap-1 text-[12px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              <TeamOutlined class="text-[11px]" />
              {{ activeMemberCount }}
            </span>
          </div>

          <div class="flex items-center gap-3">
            <a-switch v-model:checked="isDirectOnly" size="small" @change="onDirectToggle"></a-switch>
            <span class="text-[13px] text-gray-500">仅展示部门的直属成员</span>
          </div>
        </div>

        <!-- 成员表格 (平铺展示) -->
        <div class="flex-1 overflow-y-auto">
          <a-table row-key="id" :columns="columns" :data-source="dataSource" :loading="loading" :pagination="pagination"
            :scroll="{ x: 720 }" class="member-table">
            <!-- 姓名列 -->
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'name'">
                <div class="flex items-center gap-3">
                  <a-avatar :src="resolveSpaceIconUrl(record.user?.avatar, AvatarDef)" class="shrink-0" size="small">
                    {{ (record.user?.nickname || record.user?.username || 'U')[0].toUpperCase() }}
                  </a-avatar>
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="text-[14px] text-gray-900 font-medium truncate">
                      {{ record.user?.nickname || record.user?.username }}
                    </span>
                    <span v-if="isSelf(record)"
                      class="text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded border border-solid border-gray-200">
                      你自己
                    </span>
                  </div>
                </div>
              </template>

              <!-- 角色列 (所有者只读展示，非所有者支持在管理员和普通成员间切换) -->
              <template v-else-if="column.dataIndex === 'role'">
                <span v-if="record.role === SpaceMemberRole.OWNER"
                  class="text-[13px] text-gray-700 font-medium px-2 py-0.5 bg-gray-100 rounded inline-block">
                  所有者
                </span>
                <a-select v-else-if="activeTab !== 'resigned'" :value="record.role" size="small" class="w-[100px]"
                  :bordered="false" @change="(val: SpaceMemberRole) => handleRoleChange(record, val)">
                  <a-select-option :value="SpaceMemberRole.MEMBER">成员</a-select-option>
                  <a-select-option :value="SpaceMemberRole.ADMIN">管理员</a-select-option>
                </a-select>
                <span v-else class="text-[13px] text-gray-500">
                  {{ record.role === SpaceMemberRole.ADMIN ? '管理员' : '成员' }}
                </span>
              </template>

              <!-- 部门列 -->
              <template v-else-if="column.dataIndex === 'departments'">
                <div class="flex flex-wrap gap-1">
                  <span v-for="dept in record.department_names" :key="dept"
                    class="text-[12px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                    {{ dept }}
                  </span>
                  <span v-if="!record.department_names?.length" class="text-gray-400 text-[12px]">-</span>
                </div>
              </template>

              <!-- 手机号/用户名列 -->
              <template v-else-if="column.dataIndex === 'username'">
                <span class="text-gray-600 text-[13px]">{{ record.user?.username || '-' }}</span>
              </template>

              <!-- 操作列 -->
              <template v-else-if="column.key === 'action'">
                <div class="flex items-center justify-end">
                  <a-dropdown trigger="click" placement="bottomRight">
                    <a-button type="text" size="small" class="text-gray-500 hover:text-gray-800">
                      <EllipsisOutlined class="text-[16px]" />
                    </a-button>
                    <template #overlay>
                      <a-menu>
                        <a-menu-item key="detail" @click="handleShowDetail(record)">
                          查看详情
                        </a-menu-item>
                        <a-menu-item v-if="activeTab !== 'resigned'" key="dept" @click="openAdjustDept(record)">
                          调整部门
                        </a-menu-item>
                        <a-menu-item v-if="activeTab !== 'resigned' && !isSelf(record)" key="resign" danger
                          @click="handleResign(record)">
                          操作离职
                        </a-menu-item>
                        <a-menu-item v-if="activeTab === 'resigned'" key="hardDelete" danger
                          @click="handleHardDelete(record)">
                          彻底删除
                        </a-menu-item>
                      </a-menu>
                    </template>
                  </a-dropdown>
                </div>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </div>

    <!-- 弹窗组件集合 -->
    <DepartmentEditModal v-model:visible="showDeptEditModal" :edit-data="editingDept" :parent-dept-id="addSubParentId"
      :department-tree="departmentTree" @success="fetchDepartmentTree" />

    <AdjustDepartmentModal v-model:visible="showAdjustDeptModal" :member="adjustingMember"
      :department-tree="departmentTree" @success="handleAdjustDeptSuccess" />

    <AddMemberModal v-model:visible="showAddMemberModal" :department-tree="departmentTree"
      @success="handleAddMemberSuccess" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, reactive, h } from 'vue'
import { message, Modal, type TableColumnType } from 'ant-design-vue'
import {
  PlusOutlined,
  TeamOutlined,
  EllipsisOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons-vue'
import { useTable } from 'speed-components-ui/hooks'
import { space as spaceApi } from '@sk/api'
import {
  SpaceMemberRole,
  type SpaceDepartmentItem,
  type SpaceMemberListItem,
  type SpaceMemberQuery,
} from '@sk/types'
import { useUserStore } from '#sk-web/store/useUserStore'
import { resolveSpaceIconUrl } from '#sk-web/plugins/editorApis'
import AvatarDef from '#sk-web/assets/images/avatar_def.png'
import DepartmentTree from './components/DepartmentTree.vue'
import DepartmentEditModal from './components/DepartmentEditModal.vue'
import AdjustDepartmentModal from './components/AdjustDepartmentModal.vue'
import AddMemberModal from './components/AddMemberModal.vue'

const userStore = useUserStore()

// Tabs 定义
type TabKey = 'member' | 'external' | 'resigned'
const tabOptions = [
  { value: 'member' as TabKey, label: '空间成员' },
  { value: 'external' as TabKey, label: '外部联系人' },
  { value: 'resigned' as TabKey, label: '已离职人员' },
]
const activeTab = ref<TabKey>('member')

// 部门树与选中部门
const departmentTree = ref<SpaceDepartmentItem[]>([])
const selectedDeptId = ref<string | null>(null)
const selectedDeptNode = ref<SpaceDepartmentItem | null>(null)
const isDirectOnly = ref(false)
const activeMemberCount = ref(0)

const currentDeptName = computed(() => selectedDeptNode.value?.name || '')

// 判断当前行是否是登录用户自己
const isSelf = (record: SpaceMemberListItem) => {
  return record.user?.id === userStore.userInfo?.id
}

// 查询参数
const queryParams = reactive<SpaceMemberQuery>({
  tab: 'member',
  department_id: undefined,
  is_direct: false,
})

// useTable 包装成员列表接口（返回 Axios 原始响应 res，由项目的 transformRequsRes 统一解包）
const fetchMemberList = async (pageParams: any) => {
  const res = await spaceApi.listSpaceMembers({
    ...pageParams,
    tab: queryParams.tab,
    department_id: queryParams.department_id,
    is_direct: queryParams.is_direct,
  })
  if (res.data?.extra?.active_member_count !== undefined) {
    activeMemberCount.value = res.data.extra.active_member_count
  }
  return res
}

const tableOptions = computed(() => ({
  autoFetch: false,
  extraParams: {
    tab: queryParams.tab,
    department_id: queryParams.department_id,
    is_direct: queryParams.is_direct,
  },
}))

const { dataSource, loading, getList, pagination } = useTable(
  fetchMemberList as any,
  tableOptions,
)

// 表格列定义
const columns = computed<TableColumnType<SpaceMemberListItem>[]>(() => {
  const baseCols: TableColumnType<SpaceMemberListItem>[] = [
    { title: '姓名', dataIndex: 'name', ellipsis: true },
    { title: '角色', dataIndex: 'role', width: 140 },
    { title: '所属部门', dataIndex: 'departments', ellipsis: true },
    { title: '用户名', dataIndex: 'username', width: 160 },
  ]
  if (activeTab.value === 'resigned') {
    baseCols.push({
      title: '离职时间',
      dataIndex: 'deleted_at',
      width: 180,
      customRender: ({ text }) => (text ? new Date(text).toLocaleString() : '-'),
    })
  }
  baseCols.push({ title: '操作', key: 'action', width: 80, align: 'right' })
  return baseCols
})

// 获取部门树数据（优先全量树，支持全部展开与联动）
const fetchDepartmentTree = async () => {
  try {
    const res = await spaceApi.getDepartmentTree()
    departmentTree.value = res.data || []
    if (!selectedDeptId.value && departmentTree.value.length > 0) {
      // 默认选中主根部门
      const root = departmentTree.value[0]
      selectedDeptId.value = root.id
      selectedDeptNode.value = root
      queryParams.department_id = root.id
    }
    getList()
  } catch (e: any) {
    message.error('获取部门树失败')
  }
}

// 切换 Tab
const switchTab = (tab: TabKey) => {
  activeTab.value = tab
  queryParams.tab = tab
  getList()
}

// 部门树选择联动
const onSelectDepartment = (node: SpaceDepartmentItem) => {
  selectedDeptId.value = node.id
  selectedDeptNode.value = node
  queryParams.department_id = node.id
  getList()
}

// 切换直属成员开关
const onDirectToggle = (checked: boolean) => {
  queryParams.is_direct = checked
  getList()
}

// 修改角色
const handleRoleChange = async (record: SpaceMemberListItem, newRole: SpaceMemberRole) => {
  try {
    await spaceApi.updateMemberRole(record.id, newRole)
    record.role = newRole
    message.success('角色修改成功')
  } catch (e: any) {
    message.error(e?.response?.data?.detail || '角色修改失败')
  }
}

// 操作离职
const handleResign = (record: SpaceMemberListItem) => {
  Modal.confirm({
    title: '确认将该成员操作离职？',
    icon: h(ExclamationCircleOutlined),
    content: `操作离职后，${record.user?.nickname || record.user?.username} 将退出空间并移至“已离职人员”列表。`,
    okText: '确定离职',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await spaceApi.operateMemberResigned(record.id)
        message.success('离职办理成功')
        getList()
        fetchDepartmentTree()
      } catch (e: any) {
        message.error(e?.response?.data?.detail || '操作离职失败')
      }
    },
  })
}

// 彻底物理删除已离职人员
const handleHardDelete = (record: SpaceMemberListItem) => {
  Modal.confirm({
    title: '确认彻底删除该离职人员记录？',
    icon: h(ExclamationCircleOutlined),
    content: '删除后数据将无法恢复，请谨慎操作。',
    okText: '彻底删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await spaceApi.batchDeleteResignedMembers([record.id])
        message.success('记录已彻底删除')
        getList()
      } catch (e: any) {
        message.error('删除失败')
      }
    },
  })
}

// 部门弹窗控制
const showDeptEditModal = ref(false)
const editingDept = ref<SpaceDepartmentItem | null>(null)
const addSubParentId = ref<string | null>(null)

const onAddSubDepartment = (parentId: string) => {
  editingDept.value = null
  addSubParentId.value = parentId
  showDeptEditModal.value = true
}

const onEditDepartment = (node: SpaceDepartmentItem) => {
  editingDept.value = node
  addSubParentId.value = null
  showDeptEditModal.value = true
}

const onDeleteDepartment = (node: SpaceDepartmentItem) => {
  Modal.confirm({
    title: `确定删除部门【${node.name}】？`,
    icon: h(ExclamationCircleOutlined),
    content: '删除后，该部门下人员将自动解除关联；若有子部门需先删除子部门。',
    okText: '确定删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await spaceApi.deleteDepartment(node.id)
        message.success('部门删除成功')
        if (selectedDeptId.value === node.id) {
          selectedDeptId.value = null
          selectedDeptNode.value = null
          queryParams.department_id = undefined
        }
        fetchDepartmentTree()
      } catch (e: any) {
        message.error(e?.response?.data?.detail || '部门删除失败')
      }
    },
  })
}

// 调整部门弹窗
const showAdjustDeptModal = ref(false)
const adjustingMember = ref<SpaceMemberListItem | null>(null)

const openAdjustDept = (record: SpaceMemberListItem) => {
  adjustingMember.value = record
  showAdjustDeptModal.value = true
}

const handleAdjustDeptSuccess = () => {
  getList()
}

// 添加成员弹窗
const showAddMemberModal = ref(false)
const handleAddMemberSuccess = () => {
  getList()
  fetchDepartmentTree()
}

const handleShowDetail = (record: SpaceMemberListItem) => {
  message.info(`查看用户详情：${record.user?.nickname || record.user?.username}`)
}

const handleExport = () => {
  message.info('导出通讯录功能建设中')
}

onMounted(() => {
  fetchDepartmentTree()
})
</script>

<style lang="less" scoped>
.member-table :deep(.ant-table) {
  min-height: 450px;
}
</style>