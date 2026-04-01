import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

export type RobotApiEnvelope<T = any> = {
  success?: boolean;
  errorCode?: number;
  errMessage?: string;
  data?: T;
};

export type RobotApiOptions = {
  token: string;
  onError?: (msg: string) => void;
  onUnauthorized?: () => void;
};

export function createRobotRequest(options: RobotApiOptions): AxiosInstance {
  const instance = axios.create({
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
  });

  instance.interceptors.request.use((config) => {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${options.token}`;
    return config;
  });

  instance.interceptors.response.use(
    (res) => {
      const data = res.data as RobotApiEnvelope<any>;
      // 你后端如果是 success/errorCode 协议，可在这里统一判断
      if (typeof data === 'object' && data && 'errorCode' in data && data.errorCode !== 0) {
        const msg = data.errMessage || '请求失败';
        options.onError?.(msg);
        return Promise.reject(new Error(msg));
      }
      return data;
    },
    (err: AxiosError) => {
      const status = err.response?.status;
      const msg =
        (err.response?.data as any)?.errMessage ||
        (status === 401 ? '未授权或登录已过期' : '网络异常，请稍后重试');

      if (status === 401) options.onUnauthorized?.();
      options.onError?.(msg);
      return Promise.reject(err);
    },
  );

  return instance;
}
export function createRobotHttp(options: RobotApiOptions) {
  const instance = createRobotRequest(options);

  return {
    get<T>(url: string, config?: AxiosRequestConfig) {
      return instance.get<T, T>(url, config);
    },
    post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
      return instance.post<T, T>(url, data, config);
    },
    put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
      return instance.put<T, T>(url, data, config);
    },
    delete<T>(url: string, config?: AxiosRequestConfig) {
      return instance.delete<T, T>(url, config);
    },
  };
}
export function buildUrlWithQuery(url: string, query?: Record<string, any>) {
  if (!query) return url;
  const sp = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    sp.set(k, String(v));
  });
  const q = sp.toString();
  return q ? `${url}?${q}` : url;
}