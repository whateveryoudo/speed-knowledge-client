import request, { type ResponseType } from "../request";
import { authPrefix } from "../path";
import {
  CaptchaResponse,
  LoginParams,
  LoginResponse,
  SendEmailCodeRequest,
  SendEmailCodeResponse,
} from "@sk/types";

export const getVerificateCode = (): Promise<ResponseType<CaptchaResponse>> => {
  return request.get(`${authPrefix}/getVerificateCode`);
};

export const sendEmailCode = (
  data: SendEmailCodeRequest,
): Promise<ResponseType<SendEmailCodeResponse>> => {
  return request.post(`${authPrefix}/sendEmailCode`, data);
};

export const login = (
  data: LoginParams,
): Promise<ResponseType<LoginResponse>> => {
  const params: Record<string, string> = {
    username: data.username,
    password: data.password,
  };
  if (data.verificateId && data.verificateCode) {
    params.verificateId = data.verificateId;
    params.verificateCode = data.verificateCode;
  }
  return request.post(`${authPrefix}/login`, params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      silent: true,
    },
    transformRequest: [
      function (data: Record<string, string>) {
        return new URLSearchParams(data).toString();
      },
    ],
  });
};
