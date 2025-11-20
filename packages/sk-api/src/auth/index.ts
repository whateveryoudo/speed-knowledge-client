import request, { type ResponseType } from "../request";
import { authPrefix } from "../path";
import { CaptchaResponse, LoginParams, LoginResponse } from "@sk/types";
export const getVerificateCode = (): Promise<ResponseType<CaptchaResponse>> => {
  return request.get(`${authPrefix}/getVerificateCode`);
};
export const login = (
  data: LoginParams
): Promise<ResponseType<LoginResponse>> => {
  return request.post(`${authPrefix}/login`, data, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    transformRequest: [
      function (data: LoginParams) {
        return new URLSearchParams(data).toString();
      },
    ],
  });
};
