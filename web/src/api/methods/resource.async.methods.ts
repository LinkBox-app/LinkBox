import type { ResourcePreviewRequest, ResourcePreviewResponse } from '../types/resource.types';

// 模拟异步预览生成的进度回调类型
export type ProgressCallback = (progress: {
  step: 'fetching' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  error?: string;
}) => void;

/**
 * 异步生成资源预览，支持进度回调
 * @param request 预览请求数据
 * @param onProgress 进度回调函数
 * @returns Promise<ResourcePreviewResponse>
 */
export const createResourcePreviewAsync = async (
  request: ResourcePreviewRequest,
  onProgress: ProgressCallback
): Promise<ResourcePreviewResponse> => {
  try {
    // 步骤1: 开始抓取网页内容
    onProgress({
      step: 'fetching',
      progress: 10,
      message: '正在抓取网页内容...'
    });

    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    onProgress({
      step: 'fetching',
      progress: 40,
      message: '解析网页结构...'
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    onProgress({
      step: 'fetching',
      progress: 70,
      message: '提取页面内容...'
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    // 步骤2: AI处理内容
    onProgress({
      step: 'processing',
      progress: 80,
      message: '使用AI分析内容...'
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    onProgress({
      step: 'processing',
      progress: 90,
      message: '生成标题和标签...'
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    // 调用实际的API (使用alova)
    const { createResourcePreview } = await import('./resource.methods');
    const result = await createResourcePreview(request);

    // 完成
    onProgress({
      step: 'completed',
      progress: 100,
      message: '预览生成完成'
    });

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '生成预览失败';
    onProgress({
      step: 'error',
      progress: 0,
      message: '生成失败',
      error: errorMessage
    });
    throw error;
  }
};