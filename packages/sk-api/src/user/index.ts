import request, { type ResponseType } from "../request";
import { userPrefix } from "../path";
import { RegisterParams } from "@sk/types";


export const register = (data: RegisterParams): Promise<ResponseType<string>> => {
    return request.post(`${userPrefix}/`, data);
};
