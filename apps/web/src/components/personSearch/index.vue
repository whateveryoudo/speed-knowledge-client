<template>
    <a-select :value="value" mode="multiple" placeholder="请输入用户名/昵称" style="width: 100%"
        :filter-option="false" :fieldNames="{ label: 'nickname', value: 'id', }" option-label-prop="children"
        :not-found-content="fetching ? undefined : null" :options="data" @search="fetchUser"
        @update:value="handleUpdateValue">
        <template v-if="fetching || data.length === 0" #notFoundContent>
            <a-spin v-if="fetching" size="small" />
            <a-empty v-else description="暂无相关人员" />
        </template>
        <template #option="{ nickname, avatar, username }">
            <a-space :gap="10">
                <img :src="avatar || AvatarDef" alt="avatar" class="w-[30px] h-[30px]" />
                {{ nickname || username }}
                <span class="text-[var(--sd-text-caption)]" v-if="username && username !== nickname">({{ username
                }})</span>
            </a-space>
        </template>
        <template #tagRender="{ closable, onClose, value }">
            <a-tag :closable="closable" style="margin-right: 3px" @close="onClose">
                <img :src="getUserById(value)?.avatar || AvatarDef" alt="avatar"
                    class="w-[15px] h-[15px] mr-[1px] relative top-[2px]" />
                {{ getUserById(value)?.nickname || getUserById(value)?.username }}
            </a-tag>
        </template>
    </a-select>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import { debounce } from 'lodash-es';
import { user as userApi } from '@sk/api';
import { type UserInfo } from '@sk/types';
import { to } from 'await-to-js';
import AvatarDef from '#sk-web/assets/images/avatar_def.png';

const props = withDefaults(defineProps<{
    value: number[];
}>(), {
    value: () => [],
});
const emit = defineEmits<{
    (e: 'update:value', value: number[]): void;
}>();
const data = ref<UserInfo[]>([]);
// 全量用户列表（用于查找，不会被清空）
const allUsers = ref<UserInfo[]>([]);
const fetching = ref(false);
const fetchUser = debounce(async (searchValue: string) => {
    const [error, res] = await to(userApi.getFullUserList({ keyword: searchValue }));
    if (error) {
        return;
    }
    data.value = res.data;
}, 300);
// 根据 id 查找用户信息(tagRender没返回完整行？？)
const getUserById = (id: number) => {
    return allUsers.value.find((user: UserInfo) => user.id === id);
};
const handleUpdateValue = (value: number[]) => {
    emit('update:value', value);
};
const initAllUsers = async () => {
    const [error, res] = await to(userApi.getFullUserList({ keyword: '' }));
    if (!error && res.data) {
        allUsers.value = res.data;
    }
};
watch(props.value, () => {
    data.value = [];
    fetching.value = false;
});
initAllUsers();

</script>