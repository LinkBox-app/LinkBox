// 全局 toast 实例
let globalAddToast: ((type: 'info' | 'success' | 'error', message: string, duration?: number) => void) | null = null;

// 设置全局 toast 实例（由 ToastProvider 调用）
export const setGlobalToast = (addToast: typeof globalAddToast) => {
  globalAddToast = addToast;
};

// 全局 toast API
const toast = {
  info: (message: string, duration?: number) => {
    if (!globalAddToast) {
      console.warn('Toast not initialized. Make sure ToastProvider is wrapped around your app.');
      return;
    }
    globalAddToast('info', message, duration);
  },
  
  success: (message: string, duration?: number) => {
    if (!globalAddToast) {
      console.warn('Toast not initialized. Make sure ToastProvider is wrapped around your app.');
      return;
    }
    globalAddToast('success', message, duration);
  },
  
  error: (message: string, duration?: number) => {
    if (!globalAddToast) {
      console.warn('Toast not initialized. Make sure ToastProvider is wrapped around your app.');
      return;
    }
    globalAddToast('error', message, duration);
  }
};

export default toast;