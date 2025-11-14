import request, { type ResponseType } from "../request";
import { authPrefix } from "../path";
interface LoginParams {
    username: string;
    password: string;
    verificateId: string;
    verificateCode: string;
}
interface LoginResponse {
    access_token: string;
}
interface CaptchaResponse {
    captcha_id: string;
    captcha_image: string;
}
export const getVerificateCode = (): Promise<ResponseType<CaptchaResponse>> => {
    return request.get(`${authPrefix}/getVerificateCode`);
};
export const login = (data: LoginParams): Promise<ResponseType<LoginResponse>> => {
    return request.post(`${authPrefix}/login`, data, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        transformRequest: [function (data) {
            return new URLSearchParams(data).toString();
        }]
    });
};
