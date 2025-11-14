import request, { type ResponseType } from "../request";
import { userPrefix } from "../path";
interface RegisterParams {
    username: string;
    password: string;
    nickname?: string;
    verificateCode: string;
    verificateId: string;
}


export const register = (data: RegisterParams): Promise<ResponseType<string>> => {
    return request.post(`${userPrefix}/`, data);
};
