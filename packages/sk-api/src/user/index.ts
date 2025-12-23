import request, { type ResponseType } from "../request";
import { userPrefix } from "../path";
import { RegisterParams, UserInfo } from "@sk/types";

export const register = (
  data: RegisterParams
): Promise<ResponseType<string>> => {
  return request.post(`${userPrefix}/`, data);
};

export const getUserInfo = (): Promise<ResponseType<UserInfo>> => {
  return request.get(`${userPrefix}/`);
};

export const getFullUserList = (params: {
  keyword: string;
}): Promise<ResponseType<UserInfo[]>> => {
  return request.get(`${userPrefix}/full-list`, { params });
};
