<template>
    <s-full-modal width="424px" :open="open" title="新建知识库" :footer="false" @cancel="handleCancel">
        <a-form ref="formRef">
            <!-- 基本信息 -->
            <div class="mb-6">
                <div class="mt-4 mb-2 text-[var(--ant-color-text)]">基本信息</div>

                <a-form-item name="name" label="" class="mb-3">
                    <a-flex :gap="6">
                        <KnowledgeIconSelect v-model:value="form.icon" />
                        <a-input ref="nameInputRef" v-model:value="form.name" placeholder="知识库名称" />
                    </a-flex>
                </a-form-item>
                <a-form-item name="description" label="">
                    <a-textarea v-model:value="form.description" placeholder="请输入知识库简介" :rows="4" :maxlength="200" />
                </a-form-item>
            </div>
            <div class="mb-6">
                <div class="mt-4 mb-2 text-[var(--ant-color-text)]">封面</div>

                <a-form-item name="cover" label="" class="mb-3">
                    <s-custom-upload type="picture" v-model:value="form.cover" :max-count="1" />
                </a-form-item>
            </div>

            <div class="mb-6">
                <div class="mb-2 text-[var(--ant-color-text)]">新建至</div>
                <a-form-item name="team_id">
                    <a-select
                        v-model:value="form.team_id"
                        placeholder="请选择团队"
                        :loading="teamLoading"
                        :options="teamOptions"
                        option-label-prop="label"
                    >
                        <template #option="{ team }">
                            <a-flex align="center" :gap="8" class="py-0.5">
                                <img
                                    v-if="isPersonalTeam(team)"
                                    :src="userStore.userInfo.avatar || avatarDef"
                                    class="w-[24px] h-[24px] rounded-full shrink-0"
                                />
                                <IconFont
                                    v-else
                                    :type="team.icon?.startsWith('icon-') ? team.icon : 'icon-book-0'"
                                    svg-sprite
                                    class="shrink-0"
                                    style="width: 24px; height: 24px"
                                />
                                <span class="flex-1 truncate">{{ getTeamLabel(team) }}</span>
                                <LockOutlined
                                    v-if="team.visibility === 'private'"
                                    class="text-[12px] text-[var(--sd-text-caption)] shrink-0"
                                />
                            </a-flex>
                        </template>
                    </a-select>
                </a-form-item>
            </div>

            <!-- 分组 -->
            <div class="mb-6">
                <div class="mb-2 text-[var(--ant-color-text)]">分组</div>
                <a-form-item name="group_id">
                    <a-select v-model:value="form.group_id" :options="groupOptions" placeholder="请选择分组" />
                </a-form-item>
            </div>
        </a-form>
        <a-button block type="primary" :class="[!canSubmit && 'opacity-50 cursor-not-allowed']" :loading="loading"
            @click="handleOk">
            新建
        </a-button>
    </s-full-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { IconFont } from 'speed-components-ui/components'
import { LockOutlined } from '@ant-design/icons-vue'
import type { FormInstance, SelectProps } from 'ant-design-vue'
import avatarDef from '#sk-web/assets/images/avatar_def.png'
import KnowledgeIconSelect from './KnowledgeIconSelect.vue'
import { knowledge as knowledgeApi, team as teamApi } from '@sk/api'
import type { KnowledgeGroupItem, KnowledgeItem, KnowledgeCreate, TeamItem } from '@sk/types'
import { useKnowledgeList } from '../../composables/useKnowledgeListContext'
import to from 'await-to-js'
import { useSpaceStore } from '#sk-web/store/useSpaceStore'
import { useUserStore } from '#sk-web/store/useUserStore'
import { useRouter } from 'vue-router'

interface Props {
    open?: boolean
    defaultGroupId?: string
}

interface FormValues {
    name: string
    description?: string
    group_id?: string
    icon: string
    cover?: any[]
    team_id?: string
}

const props = withDefaults(defineProps<Props>(), {
    open: false,
    defaultGroupId: undefined,
})

const spaceStore = useSpaceStore()
const userStore = useUserStore()
const router = useRouter()
const { initCommonPinList } = useKnowledgeList()
const emit = defineEmits<{
    (e: 'update:open', value: boolean): void
    (e: 'ok', knowledge: KnowledgeItem): void
}>()

const formRef = ref<FormInstance>()
const nameInputRef = ref<HTMLInputElement>()
const loading = ref(false)
const teamLoading = ref(false)
const teamList = ref<TeamItem[]>([])
const groupList = ref<KnowledgeGroupItem[]>([])

const form = ref<FormValues>({
    name: '',
    description: '',
    cover: [],
    team_id: undefined,
    group_id: undefined,
    icon: 'icon-book-0',
})
const groupOptions = ref<SelectProps['options']>([])

const isPersonalTeam = (team: TeamItem) =>
    team.is_default || team.owner_id === userStore.userInfo.id

const getTeamLabel = (team: TeamItem) => {
    if (team.is_default) {
        return userStore.userInfo.nickname || userStore.userInfo.username || team.name
    }
    return team.name
}

const teamOptions = computed(() =>
    teamList.value.map((team) => ({
        value: team.id,
        label: getTeamLabel(team),
        team,
    })),
)

const canSubmit = computed(() => {
    return !!form.value.name.trim() && !!form.value.group_id && !!form.value.team_id
})

const resolveDefaultTeamId = (teams: TeamItem[]) => {
    const defaultTeam = teams.find((item) => item.is_default)
    if (defaultTeam) {
        return defaultTeam.id
    }
    const ownedTeam = teams.find((item) => item.owner_id === userStore.userInfo.id)
    return ownedTeam?.id ?? teams[0]?.id
}

const getTeamListData = async () => {
    const spaceId = spaceStore.spaceInfo.id
    if (!spaceId) {
        return
    }
    teamLoading.value = true
    const [error, res] = await to(teamApi.getTeamList(spaceId))
    teamLoading.value = false
    if (error) {
        return
    }
    teamList.value = res.data
    form.value.team_id = resolveDefaultTeamId(res.data)
}

const resolveDefaultGroupId = (groups: KnowledgeGroupItem[]) => {
    if (props.defaultGroupId) {
        return props.defaultGroupId
    }
    const defaultGroup = groups.find((item) => item.is_default)
    if (defaultGroup) {
        return defaultGroup.id
    }
    const myKnowledgeGroup = groups.find((item) => item.group_name === '我的知识库')
    return myKnowledgeGroup?.id ?? groups[0]?.id
}

const getKnowledgeGroupListData = async () => {
    const [error, res] = await to(knowledgeApi.getKnowledgeGroupList())
    if (error) {
        return
    }
    groupList.value = res.data
    groupOptions.value = res.data.map((item: KnowledgeGroupItem) => ({
        label: item.group_name,
        value: item.id,
    }))
    form.value.group_id = resolveDefaultGroupId(res.data)
}

const resetForm = () => {
    form.value = {
        name: '',
        description: '',
        group_id: resolveDefaultGroupId(groupList.value),
        icon: 'icon-book-0',
        team_id: resolveDefaultTeamId(teamList.value),
        cover: [],
    }
    formRef.value?.clearValidate()
}

const handleOk = async () => {
    if (!canSubmit.value) return
    try {
        loading.value = true
        const reqParams: KnowledgeCreate = {
            name: form.value.name,
            description: form.value.description,
            cover_url: form.value.cover?.[0],
            group_id: form.value?.group_id ?? '',
            icon: form.value.icon,
            team_id: form.value.team_id ?? '',
            space_id: spaceStore.spaceInfo.id,
        }
        const [error, res] = await to(knowledgeApi.addKnowledge(reqParams))
        if (error) {
            loading.value = false
            return
        }
        const [detailError, detailRes] = await to(knowledgeApi.getKnowledgeDetail(res.data))
        loading.value = false
        if (detailError) {
            return
        }
        const knowledge = detailRes.data
        emit('update:open', false)
        emit('ok', knowledge)
        initCommonPinList()
        router.push(`/${knowledge.team.slug}/knowledge/${knowledge.slug}`)
    } catch (error) {
        console.error('表单验证失败:', error)
    }
}

const handleCancel = () => {
    emit('update:open', false)
}

watch(() => props.open, async (val) => {
    if (val) {
        resetForm()
        await nextTick()
        nameInputRef.value?.focus()
        await getTeamListData()
        await getKnowledgeGroupListData()
        if (!form.value.team_id) {
            form.value.team_id = resolveDefaultTeamId(teamList.value)
        }
        if (!form.value.group_id) {
            form.value.group_id = resolveDefaultGroupId(groupList.value)
        }
    }
}, { immediate: true })
</script>

<style lang="less" scoped>
:deep(.ant-form-item-label) {
    font-weight: 500;
}
</style>
