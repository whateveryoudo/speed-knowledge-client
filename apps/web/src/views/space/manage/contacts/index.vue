<template>
  <div class="flex flex-col h-full bg-white">
    <!-- 顶部主标题 (独占一行) -->
    <h2 class="text-[18px] font-semibold text-gray-900 m-0 mb-4 shrink-0">通讯录</h2>

    <!-- Tab 栏与操作栏 (独占一行：左侧 a-segmented 分段控制器，右侧搜索与操作按钮) -->
    <div class="flex items-center justify-between pb-4 shrink-0">
      <div class="w-fit">
        <a-segmented v-model:value="activeTab" :options="tabOptions" @change="switchTab" />
      </div>

      <!-- 右侧操作栏：根据当前 Tab 动态展示不同的操作 -->
      <div class="flex items-center gap-3">
        <!-- 搜索框（外部联系人与已离职人员 Tab 下展示） -->
        <a-input-search
          v-if="activeTab !== 'member'"
          v-model:value="searchKeyword"
          :placeholder="activeTab === 'external' ? '搜索外部联系人' : '搜索已离职人员'"
          class="w-[220px]"
          allow-clear
          @search="handleSearch"
          @press-enter="handleSearch"
        />

        <!-- 空间成员操作栏 -->
        <template v-if="activeTab === 'member'">
          <a-button class="rounded-[6px]" @click="handleExport">导出</a-button>
          <a-dropdown placement="bottomRight">
            <a-button
              type="primary"
              class="rounded-[6px]"
            >
              添加成员
            </a-button>
            <template #overlay>
              <a-menu class="min-w-[170px] rounded-[8px] py-1 shadow-md">
                <a-menu-item key="link" class="py-2 px-3 text-[13px]" @click="showInviteModal = true">
                  <div class="flex items-center gap-2">
                    <LinkOutlined class="text-[14px]" />
                    <span>链接邀请成员</span>
                  </div>
                </a-menu-item>
                <a-menu-item
                  key="phone"
                  class="py-2 px-3 text-[13px]"
                  @click="message.info('手机号邀请功能正在开发中')"
                >
                  <div class="flex items-center gap-2">
                    <PhoneOutlined class="text-[14px]" />
                    <span>手机号邀请成员</span>
                  </div>
                </a-menu-item>
                <a-menu-item
                  key="batch"
                  class="py-2 px-3 text-[13px]"
                  @click="message.info('批量导入功能正在开发中')"
                >
                  <div class="flex items-center gap-2">
                    <ImportOutlined class="text-[14px]" />
                    <span>批量导入</span>
                  </div>
                </a-menu-item>
                <a-menu-divider />
              </a-menu>
            </template>
          </a-dropdown>
        </template>

        <!-- 外部联系人操作栏 -->
        <template v-else-if="activeTab === 'external'">
          <a-button
            type="primary"
            class="rounded-[6px]"
            @click="handleAddExternal"
          >
            <template #icon>
              <PlusOutlined />
            </template>
            添加外部联系人
          </a-button>
        </template>

        <!-- 已离职人员操作栏：有选定项时展示批量操作按钮 -->
        <template v-else-if="activeTab === 'resigned' && selectedRowKeys.length > 0">
          <a-button danger class="rounded-[6px]" @click="handleBatchHardDelete">
            批量彻底删除 ({{ selectedRowKeys.length }})
          </a-button>
        </template>
      </div>
    </div>

    <!-- 主体区域：空间成员展示左右分栏（部门树+列表），外部联系人与已离职人员无部门树平铺满屏 -->
    <div
      class="flex-1 min-h-0 flex border border-solid border-[var(--sd-border-primary)] rounded-[8px] overflow-hidden bg-white"
    >
      <!-- 左栏：部门树 (仅在“空间成员”Tab展示) -->
      <DepartmentTree
        v-if="activeTab === 'member'"
        :tree-data="departmentTree"
        :selected-id="selectedDeptId"
        @select="onSelectDepartment"
        @add-sub="onAddSubDepartment"
        @edit="onEditDepartment"
        @delete="onDeleteDepartment"
      />

      <!-- 右栏/主区：人员列表区域 -->
      <div class="flex-1 flex flex-col min-w-0 h-full p-5 overflow-hidden">
        <!-- 列表头部 -->
        <div class="pb-3 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2">
            <!-- 空间成员 Tab 头部 -->
            <template v-if="activeTab === 'member'">
              <span class="text-[16px] font-medium text-gray-900">
                {{ currentDeptName || '全部成员' }}
              </span>
              <span
                class="inline-flex items-center gap-1 text-[12px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full"
              >
                <TeamOutlined class="text-[11px]" />
                {{ activeMemberCount }}
              </span>
            </template>

            <!-- 外部联系人 Tab 头部 -->
            <template v-else-if="activeTab === 'external'">
              <span class="text-[16px] font-medium text-gray-900">外部联系人</span>
              <span
                class="inline-flex items-center gap-1 text-[12px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ml-1"
              >
                <TeamOutlined class="text-[11px]" />
                {{ pagination.total || dataSource.length }}
              </span>
            </template>

            <!-- 已离职人员 Tab 头部 -->
            <template v-else>
              <span class="text-[16px] font-medium text-gray-900">已离职人员</span>
              <span
                class="inline-flex items-center gap-1 text-[12px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ml-1"
              >
                <TeamOutlined class="text-[11px]" />
                {{ pagination.total || dataSource.length }}
              </span>
            </template>
          </div>

          <!-- 右侧：直属成员开关（仅空间成员展示）或已选提示 -->
          <div v-if="activeTab === 'member'" class="flex items-center gap-3">
            <a-switch v-model:checked="isDirectOnly" size="small" @change="onDirectToggle" />
            <span class="text-[13px] text-gray-500">仅展示部门的直属成员</span>
          </div>
          <div
            v-else-if="activeTab === 'resigned' && selectedRowKeys.length > 0"
            class="flex items-center gap-2 text-[13px] text-gray-500"
          >
            <span>已选 {{ selectedRowKeys.length }} 项</span>
          </div>
        </div>

        <!-- 成员表格 -->
        <div class="flex-1 overflow-y-auto">
          <a-table
            row-key="id"
            :columns="columns"
            :data-source="dataSource"
            :loading="loading"
            :pagination="pagination"
            :row-selection="rowSelection"
            :scroll="{ x: 720 }"
            class="member-table"
          >
            <template #bodyCell="{ column, record }">
              <!-- 姓名列 -->
              <template v-if="column.dataIndex === 'name'">
                <div class="flex items-center gap-3">
                  <a-avatar
                    :src="resolveSpaceIconUrl(record.user?.avatar, AvatarDef)"
                    class="shrink-0"
                    size="small"
                  >
                    {{ (record.user?.nickname || record.user?.username || 'U')[0].toUpperCase() }}
                  </a-avatar>
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="text-[14px] text-gray-900 font-medium truncate">
                      {{ record.user?.nickname || record.user?.username }}
                    </span>
                    <span
                      v-if="isSelf(record)"
                      class="text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded border border-solid border-gray-200"
                    >
                      你自己
                    </span>
                  </div>
                </div>
              </template>

              <!-- 角色列 (空间成员) -->
              <template v-else-if="column.dataIndex === 'role'">
                <span
                  v-if="record.role === SpaceMemberRole.OWNER"
                  class="text-[13px] text-gray-700 font-medium px-2 py-0.5 bg-gray-100 rounded inline-block"
                >
                  所有者
                </span>
                <a-select
                  v-else
                  :value="record.role"
                  size="small"
                  class="w-[80px]"
                  :bordered="false"
                  @change="(val: SpaceMemberRole) => handleRoleChange(record, val)"
                >
                  <a-select-option :value="SpaceMemberRole.MEMBER">成员</a-select-option>
                  <a-select-option :value="SpaceMemberRole.ADMIN">管理员</a-select-option>
                </a-select>
              </template>

              <!-- 帐号状态列 (外部联系人) -->
              <template v-else-if="column.dataIndex === 'status'">
                <span class="inline-flex items-center gap-1.5 text-[13px] text-gray-600">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  正常
                </span>
              </template>

              <!-- 所属部门列 -->
              <template v-else-if="column.dataIndex === 'departments'">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="dept in record.department_names"
                    :key="dept"
                    class="text-[12px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded"
                  >
                    {{ dept }}
                  </span>
                  <span v-if="!record.department_names?.length" class="text-gray-400 text-[12px]">-</span>
                </div>
              </template>

              <!-- 手机号/用户名列 -->
              <template v-else-if="column.dataIndex === 'username'">
                <span class="text-gray-600 text-[13px]">{{ record.user?.username || '-' }}</span>
              </template>
              <template v-else-if="column.dataIndex === 'mobile_or_username'">
                <span class="text-gray-600 text-[13px]">
                  {{ record.user?.mobile || record.user?.username || '-' }}
                </span>
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
                        <!-- 空间成员专属操作 -->
                        <template v-if="activeTab === 'member'">
                          <!-- 非本人成员：可调整部门 -->
                          <a-menu-item
                            v-if="!isSelf(record)"
                            key="dept"
                            @click="openAdjustDept(record)"
                          >
                            调整部门
                          </a-menu-item>

                          <!-- 仅所有者在自己这一行可发起“转让空间所有权” -->
                          <a-menu-item
                            v-if="isSelf(record) && isCurrentOwner"
                            key="transferSelf"
                            @click="openTransferOwnerModal(null)"
                          >
                            转让空间所有权
                          </a-menu-item>

                          <!-- 操作他人离职 -->
                          <a-menu-item
                            v-if="!isSelf(record) && record.role !== SpaceMemberRole.OWNER"
                            key="resign"
                            danger
                            @click="handleResign(record)"
                          >
                            操作离职
                          </a-menu-item>

                          <!-- 自己退出空间 (非 Owner) -->
                          <a-menu-item
                            v-if="isSelf(record) && record.role !== SpaceMemberRole.OWNER"
                            key="quit"
                            danger
                            @click="handleQuitSpace(record)"
                          >
                            退出空间
                          </a-menu-item>
                        </template>

                        <!-- 外部联系人操作 -->
                        <template v-else-if="activeTab === 'external'">
                          <a-menu-item key="removeExternal" danger @click="handleRemoveExternal(record)">
                            移除
                          </a-menu-item>
                        </template>

                        <!-- 已离职人员操作 -->
                        <template v-else-if="activeTab === 'resigned'">
                          <a-menu-item key="hardDelete" danger @click="handleHardDelete(record)">
                            彻底删除
                          </a-menu-item>
                        </template>
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
    <DepartmentEditModal
      v-model:visible="showDeptEditModal"
      :edit-data="editingDept"
      :parent-dept-id="addSubParentId"
      :department-tree="departmentTree"
      @success="fetchDepartmentTree"
    />

    <AdjustDepartmentModal
      v-model:visible="showAdjustDeptModal"
      :member="adjustingMember"
      :department-tree="departmentTree"
      @success="handleAdjustDeptSuccess"
    />

    <AddMemberModal
      v-model:visible="showAddMemberModal"
      :department-tree="departmentTree"
      @success="handleAddMemberSuccess"
    />

    <OrgInviteModal
      v-model:visible="showInviteModal"
      org-type="space"
      :org-id="spaceStore.spaceInfo?.id || ''"
      :org-name="spaceStore.spaceInfo?.name"
      :default-dept-id="selectedDeptId"
      :department-tree="departmentTree"
    />

    <TransferOwnerModal
      v-model:visible="showTransferOwnerModal"
      :current-user-id="userStore.userInfo?.id"
      :pre-selected-member="transferTargetMember"
      @success="handleTransferSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, reactive, h } from 'vue'
import { message, Modal, type TableColumnType } from 'ant-design-vue'
import {
  PlusOutlined,
  ShareAltOutlined,
  TeamOutlined,
  EllipsisOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  PhoneOutlined,
  ImportOutlined,
  SendOutlined,
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
import { useSpaceStore } from '#sk-web/store/useSpaceStore'
import { resolveSpaceIconUrl } from '#sk-web/plugins/editorApis'
import AvatarDef from '#sk-web/assets/images/avatar_def.png'
import DepartmentTree from './components/DepartmentTree.vue'
import DepartmentEditModal from './components/DepartmentEditModal.vue'
import AdjustDepartmentModal from './components/AdjustDepartmentModal.vue'
import AddMemberModal from './components/AddMemberModal.vue'
import TransferOwnerModal from './components/TransferOwnerModal.vue'
import OrgInviteModal from '#sk-web/components/business/org/OrgInviteModal.vue'

const userStore = useUserStore()
const spaceStore = useSpaceStore()

// Tabs 定义
type TabKey = 'member' | 'external' | 'resigned'
const tabOptions = [
  { value: 'member' as TabKey, label: '空间成员' },
  { value: 'external' as TabKey, label: '外部联系人' },
  { value: 'resigned' as TabKey, label: '已离职人员' },
]
const activeTab = ref<TabKey>('member')
const searchKeyword = ref('')

// 部门树与选中部门
const departmentTree = ref<SpaceDepartmentItem[]>([])
const selectedDeptId = ref<string | null>(null)
const selectedDeptNode = ref<SpaceDepartmentItem | null>(null)
const isDirectOnly = ref(false)
const activeMemberCount = ref(0)
const selectedRowKeys = ref<string[]>([])

const currentDeptName = computed(() => selectedDeptNode.value?.name || '')

// 判断当前行是否是登录用户自己
const isSelf = (record: SpaceMemberListItem) => {
  return record.user?.id === userStore.userInfo?.id
}

// 判断当前登录人是否是空间 Owner
const isCurrentOwner = computed(() => {
  if (
    spaceStore.spaceInfo?.owner_id &&
    userStore.userInfo?.id &&
    String(spaceStore.spaceInfo.owner_id) === String(userStore.userInfo.id)
  ) {
    return true
  }
  return dataSource.value.some((item) => isSelf(item) && item.role === SpaceMemberRole.OWNER)
})

// 查询参数
const queryParams = reactive<SpaceMemberQuery>({
  tab: 'member',
  keyword: undefined,
  department_id: undefined,
  is_direct: false,
})

// useTable 包装成员列表接口
const fetchMemberList = async (pageParams: any) => {
  const res = await spaceApi.listSpaceMembers({
    ...pageParams,
    tab: queryParams.tab,
    keyword: queryParams.keyword,
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
    keyword: queryParams.keyword,
    department_id: queryParams.department_id,
    is_direct: queryParams.is_direct,
  },
}))

const { dataSource, loading, getList, pagination } = useTable(
  fetchMemberList as any,
  tableOptions,
)

// 多选配置（在已离职列表支持批量删除）
const rowSelection = computed(() => {
  if (activeTab.value !== 'resigned') {
    return undefined
  }
  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys: (string | number)[]) => {
      selectedRowKeys.value = keys as string[]
    },
  }
})

// 表格列定义：根据当前 Tab 返回对应的字段列
const columns = computed<TableColumnType<SpaceMemberListItem>[]>(() => {
  if (activeTab.value === 'member') {
    return [
      { title: '姓名', dataIndex: 'name', ellipsis: true },
      { title: '角色', dataIndex: 'role', width: 140 },
      { title: '所属部门', dataIndex: 'departments', ellipsis: true },
      { title: '用户名', dataIndex: 'username', width: 160 },
      { title: '操作', key: 'action', width: 80, align: 'right' },
    ]
  }

  if (activeTab.value === 'external') {
    return [
      { title: '姓名', dataIndex: 'name', ellipsis: true },
      { title: '帐号状态', dataIndex: 'status', width: 130 },
      { title: '手机号 / 用户名', dataIndex: 'mobile_or_username', width: 180 },
      {
        title: '加入时间',
        dataIndex: 'created_at',
        width: 170,
        customRender: ({ text }) => (text ? new Date(text).toLocaleDateString() : '-'),
      },
      { title: '操作', key: 'action', width: 80, align: 'right' },
    ]
  }

  // 已离职人员列
  return [
    { title: '姓名', dataIndex: 'name', ellipsis: true },
    { title: '原所属部门', dataIndex: 'departments', ellipsis: true },
    {
      title: '离职时间',
      dataIndex: 'deleted_at',
      width: 180,
      customRender: ({ text }) => (text ? new Date(text).toLocaleString() : '-'),
    },
    { title: '用户名', dataIndex: 'username', width: 160 },
    { title: '操作', key: 'action', width: 80, align: 'right' },
  ]
})

// 获取部门树数据
const fetchDepartmentTree = async () => {
  try {
    const res = await spaceApi.getDepartmentTree()
    departmentTree.value = res.data || []
    if (!selectedDeptId.value && departmentTree.value.length > 0) {
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

// 切换 Tab：重置无树 Tab 的部门过滤与选中态
const switchTab = (tab: TabKey) => {
  activeTab.value = tab
  queryParams.tab = tab
  selectedRowKeys.value = []
  searchKeyword.value = ''
  queryParams.keyword = undefined

  if (tab !== 'member') {
    queryParams.department_id = undefined
    getList()
  } else {
    queryParams.department_id = selectedDeptId.value || undefined
    getList()
  }
}

// 搜索事件
const handleSearch = () => {
  queryParams.keyword = searchKeyword.value?.trim() || undefined
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

// 退出空间 (自身操作)
const handleQuitSpace = (record: SpaceMemberListItem) => {
  Modal.confirm({
    title: '确认退出该空间？',
    icon: h(ExclamationCircleOutlined),
    content: '退出后你将无法继续访问该空间的内容，如需重新加入需由管理员再次邀请。',
    okText: '确认退出',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await spaceApi.operateMemberResigned(record.id)
        message.success('已退出空间')
        window.location.reload()
      } catch (e: any) {
        message.error(e?.response?.data?.detail || '退出空间失败')
      }
    },
  })
}

// 移除外部联系人
const handleRemoveExternal = (record: SpaceMemberListItem) => {
  Modal.confirm({
    title: '确认移除该外部联系人？',
    icon: h(ExclamationCircleOutlined),
    content: `移除后，${record.user?.nickname || record.user?.username} 将退出该空间并失去所有协作访问权限。`,
    okText: '确认移除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await spaceApi.operateMemberResigned(record.id)
        message.success('已移除外部联系人')
        getList()
      } catch (e: any) {
        message.error(e?.response?.data?.detail || '移除失败')
      }
    },
  })
}

// 彻底物理删除已离职人员（单行）
const handleHardDelete = (record: SpaceMemberListItem) => {
  Modal.confirm({
    title: '确认彻底删除该离职人员记录？',
    icon: h(ExclamationCircleOutlined),
    content: `彻底删除后，${record.user?.nickname || record.user?.username} 在该空间下的所有协同权限记录将被物理清除，且不可恢复。`,
    okText: '彻底删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await spaceApi.batchDeleteResignedMembers([record.id])
        message.success('记录已彻底删除')
        selectedRowKeys.value = selectedRowKeys.value.filter((id) => id !== record.id)
        getList()
      } catch (e: any) {
        message.error(e?.response?.data?.detail || '删除失败')
      }
    },
  })
}

// 批量彻底物理删除
const handleBatchHardDelete = () => {
  if (!selectedRowKeys.value.length) return
  Modal.confirm({
    title: `确认彻底删除选中的 ${selectedRowKeys.value.length} 条离职记录？`,
    icon: h(ExclamationCircleOutlined),
    content: '彻底删除后，这些用户在该空间下的所有协同权限记录将被物理清除，且不可恢复。',
    okText: '确认批量删除',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      try {
        await spaceApi.batchDeleteResignedMembers(selectedRowKeys.value)
        message.success('已批量彻底删除')
        selectedRowKeys.value = []
        getList()
      } catch (e: any) {
        message.error(e?.response?.data?.detail || '批量删除失败')
      }
    },
  })
}

// 转让空间所有权弹窗
const showTransferOwnerModal = ref(false)
const transferTargetMember = ref<SpaceMemberListItem | null>(null)

const openTransferOwnerModal = (record: SpaceMemberListItem) => {
  transferTargetMember.value = record
  showTransferOwnerModal.value = true
}

const handleTransferSuccess = (exitSpace: boolean) => {
  spaceStore.checkSpaceAccess()
  if (exitSpace) {
    message.info('你已转让所有权并退出该空间')
    window.location.reload()
  } else {
    getList()
  }
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

// 邀请成员弹窗
const showInviteModal = ref(false)

// 添加成员弹窗
const showAddMemberModal = ref(false)
const handleAddMemberSuccess = () => {
  getList()
  fetchDepartmentTree()
}

// 添加外部联系人
const handleAddExternal = () => {
  message.info('添加外部联系人功能待开发')
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