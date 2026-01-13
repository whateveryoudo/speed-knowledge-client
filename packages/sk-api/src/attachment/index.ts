import request, { type ResponseType } from "../request";
import { attachmentPrefix } from "../path";

export const fileUploadSingle = (data: any): Promise<ResponseType<any>> => {
  return request.post(`${attachmentPrefix}/upload/single`, data);
};

export const fileDownload = (id: string): Promise<ResponseType<any>> => {
  return request.get(`${attachmentPrefix}/download/${id}`, {
    responseType: 'blob',
    headers: {
      fullRes: true,
    },
  });
};
