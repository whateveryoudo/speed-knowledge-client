import request, { type ResponseType } from "../request";
import { attachmentPrefix } from "../path";

export const fileUploadSingle = (data: any): Promise<ResponseType<any>> => {
  return request.post(`${attachmentPrefix}/upload/single`, data);
};

