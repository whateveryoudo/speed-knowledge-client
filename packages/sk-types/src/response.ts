export type ResponseType<T = any> = {
  errCode: number;
  errMessage: string;
  success: boolean;
  data: T;
  [key: string]: any;
};
