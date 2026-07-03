import request, { type ResponseType } from '../request'
import { searchPrefix } from '../path'
import type { SearchQuery, SearchResponse } from '@sk/types'

/** 通用搜索（全局 / 知识库内） */
export const search = (
  data: SearchQuery,
): Promise<ResponseType<SearchResponse>> => {
  return request.post(`${searchPrefix}/`, data)
}
