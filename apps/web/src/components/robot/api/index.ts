import { createRobotHttp, buildUrlWithQuery, type RobotApiOptions } from './request';
import type { PaginationResponse, ConversationItem, MessageItem, RobotEndpoints } from '../composables/types';
import { cloneDeep } from 'lodash-es';

export function createRobotApi(opts: RobotApiOptions & { endpoints: RobotEndpoints }) {
    const http = createRobotHttp(opts);
    const { endpoints, token } = opts;

    return {
        listConversations(params: Record<string, any>) {
            return http.get<PaginationResponse<ConversationItem>>(buildUrlWithQuery(endpoints.history, params));
        },

        listMessages(params: Record<string, any>) {
            const restParams = cloneDeep(params);
            delete restParams.conversation_id;
            // 这里sessionid拼接在url上
            return http.get<PaginationResponse<MessageItem>>(buildUrlWithQuery(endpoints.message + '/' + params.conversation_id, restParams));
        },

        renameConversation(id: string, name: string) {
            const url = endpoints.rename?.(id) ?? `/deepApi/v1/conversations/${id}/name`;
            return http.post(url, { name, user: token });
        },

        deleteConversation(id: string) {
            const url = endpoints.remove?.(id) ?? `/deepApi/v1/conversations/${id}`;
            return http.delete(url, { data: { user: token } });
        }
    };
}