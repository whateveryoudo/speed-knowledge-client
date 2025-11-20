export interface LoginParams {
  username: string;
  password: string;
  verificateId: string;
  verificateCode: string;
}
export interface LoginResponse {
  access_token: string;
}
export interface CaptchaResponse {
  captcha_id: string;
  captcha_image: string;
}
