import alova from "..";
import type {
  ResourceResponse,
  ResourceUpdate,
  ResourceListResponse,
  ResourcePreviewRequest,
  ResourcePreviewResponse,
  ResourceCreateRequest,
  DeleteResourceResponse,
} from "../types/resource.types";

/**
 * 按标签分页查询资源
 * @param tagName 标签名称
 * @param page 页码，从1开始
 * @param size 每页数量，默认20，最大100
 * @returns Promise<ResourceListResponse>
 */
export const getResourcesByTag = (
  tagName: string,
  page: number = 1,
  size: number = 20
) =>
  alova.Get<ResourceListResponse>(`/resources/by-tag/${tagName}`, {
    params: { page, size },
  });

/**
 * 更新资源
 * @param resourceId 资源ID
 * @param resourceData 更新数据
 * @returns Promise<ResourceResponse>
 */
export const updateResource = (resourceId: number, resourceData: ResourceUpdate) =>
  alova.Put<ResourceResponse>(`/resources/${resourceId}`, resourceData);

/**
 * 删除资源（软删除）
 * @param resourceId 资源ID
 * @returns Promise<DeleteResourceResponse>
 */
export const deleteResource = (resourceId: number) =>
  alova.Delete<DeleteResourceResponse>(`/resources/${resourceId}`);

/**
 * 生成资源预览
 * @param request 预览请求数据
 * @returns Promise<ResourcePreviewResponse>
 */
export const createResourcePreview = (request: ResourcePreviewRequest) =>
  alova.Post<ResourcePreviewResponse>("/resources/preview", request);

/**
 * 创建资源
 * @param request 创建资源请求数据
 * @returns Promise<ResourceResponse>
 */
export const createResource = (request: ResourceCreateRequest) =>
  alova.Post<ResourceResponse>("/resources/", request);