import { h } from "vue";
import { useRouter } from "vue-router";
import { to } from "await-to-js";
import { common as commonApi } from '@sk/api';
import { CollectResourceType } from "@sk/types";
import { message } from "ant-design-vue";

export const useCollect = () => {

    const router = useRouter();

    const handleCollect = async (hasCollected: boolean, params: {
        identifier: string;
        resource_type: CollectResourceType;
        onSuccess?: () => void;
    }) => {
        if (hasCollected) {
            const [error] = await to(commonApi.removeCollect({ identifier: params.identifier, resource_type: params.resource_type }));
            if (!error) {
                message.success('取消收藏成功');
                params.onSuccess?.();
            }
        } else {
            const [error] = await to(commonApi.addCollect({ identifier: params.identifier, resource_type: params.resource_type }));
            if (!error) {
                message.success(h('span', {
                }, [
                    '收藏成功,请前往',
                    h('a', {
                        href: '#',
                        class: 'text-blue-500 cursor-pointer',
                        onClick: (e: Event) => {
                            e.preventDefault();
                            router.push('/dashboard/collect');
                        }
                    }, '收藏夹'),
                    '查看'
                ]));
                params.onSuccess?.();
            }
        }
    };

    return {
        handleCollect
    }
}