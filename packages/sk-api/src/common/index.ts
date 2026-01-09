import { type CollectResourceType } from "@sk/types";
import request from "../request";
import { apiVersion } from "../path";
const collectPrefix = `${apiVersion}/collect`;

export const addCollect = (data: {
  identifier: string;
  resource_type: CollectResourceType;
}) => {
  return request.post(`${collectPrefix}/`, data);
};
export const removeCollect = (data: {
  identifier: string;
  resource_type: CollectResourceType;
}) => {
  return request.delete(`${collectPrefix}/`, { data });
};
