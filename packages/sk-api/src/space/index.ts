import request, { type ResponseType } from "../request";
import { spacePrefix } from "../path";
import type { SpaceItem } from "@sk/types";

export const getSpaceInfo = (): Promise<ResponseType<SpaceItem>> => {
  return request.get(`${spacePrefix}/`);
};
export const getSpaceInfoByDomin = (space_domin: string): Promise<ResponseType<SpaceItem>> => {
  return request.get(`${spacePrefix}/by_domin/${space_domin}`);
};