import alova from "..";

/**
 * 标签响应类型
 */
export interface TagResponse {
  id: number;
  name: string;
  user_id: number; 
  created_at: string | null; // ISO 字符串格式的日期时间
}

/**
 * 创建标签请求类型
 */
export interface TagCreateRequest {
  name: string;
}

/**
 * 标签列表响应类型
 */
export interface TagListResponse {
  tags: string[];
}

/**
 * 删除标签响应类型
 */
export interface TagDeleteResponse {
  message: string;
}

/**
 * 获取用户所有标签
 * @returns Promise<TagResponse[]>
 */
export const getUserTags = () =>
  alova.Get<TagResponse[]>("/tags/");

/**
 * 创建标签
 * @param request 创建标签请求数据
 * @returns Promise<TagResponse>
 */
export const createTag = (request: TagCreateRequest) =>
  alova.Post<TagResponse>("/tags/", request);

/**
 * 删除标签
 * @param tagId 标签ID
 * @returns Promise<TagDeleteResponse>
 */
export const deleteTag = (tagId: number) =>
  alova.Delete<TagDeleteResponse>(`/tags/${tagId}`);