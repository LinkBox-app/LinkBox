/**
 * 资源管理相关的类型定义
 */

// 资源响应类型
export interface ResourceResponse {
  id: number;
  url: string;
  title: string;
  digest: string;
  user_id: number;
  tags: string[]; // 资源标签列表
  created_at: string; // ISO 8601 格式的日期字符串
  updated_at: string; // ISO 8601 格式的日期字符串
}

// 更新资源请求类型
export interface ResourceUpdate {
  title?: string; // 资源标题（最大500个字符）
  digest?: string; // 资源摘要
  tags?: string[]; // 标签列表
}

// 资源列表响应类型
export interface ResourceListResponse {
  resources: ResourceResponse[];
  total: number; // 总数量
  page: number; // 当前页码
  size: number; // 每页数量
  pages: number; // 总页数
}

// 资源预览请求类型
export interface ResourcePreviewRequest {
  url: string; // 资源链接
  note?: string; // 用户备注
}

// 资源预览响应类型
export interface ResourcePreviewResponse {
  title: string; // AI生成的标题
  tags: string[]; // AI生成的标签列表
  digest: string; // AI生成的摘要
  url: string; // 原始链接
}

// 创建资源请求类型
export interface ResourceCreateRequest {
  url: string; // 资源链接
  title: string; // 资源标题（最大500个字符）
  tags: string[]; // 标签列表
  digest: string; // 资源摘要
}

// 删除资源响应类型
export interface DeleteResourceResponse {
  message: string;
}