import { LOCALE_KEY } from './storage-key.constant';

const DEFAULT_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:7032';

interface RuntimeConfig {
  apiBaseUrl: string;
  isDesktop: boolean;
}

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
  }
}

let runtimeConfig: RuntimeConfig = {
  apiBaseUrl: DEFAULT_API_BASE_URL,
  isDesktop: false,
};

const detectLocale = () => {
  const storedLocale = localStorage.getItem(LOCALE_KEY);
  if (storedLocale === 'zh-CN' || storedLocale === 'en-US') {
    return storedLocale;
  }

  return navigator.language.toLowerCase().startsWith('en') ? 'en-US' : 'zh-CN';
};

const isDesktopRuntime = () =>
  typeof window !== 'undefined' && typeof window.__TAURI_INTERNALS__ !== 'undefined';

const waitForBackend = async (apiBaseUrl: string) => {
  const maxAttempts = 40;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await fetch(`${apiBaseUrl}/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // sidecar is still booting
    }

    await new Promise((resolve) => window.setTimeout(resolve, 250));
  }

  throw new Error(
    detectLocale() === 'en-US'
      ? 'Timed out while waiting for the desktop backend to start'
      : '桌面端后端服务启动超时'
  );
};

export const loadRuntimeConfig = async () => {
  if (!isDesktopRuntime()) {
    runtimeConfig = {
      apiBaseUrl: DEFAULT_API_BASE_URL,
      isDesktop: false,
    };
    return runtimeConfig;
  }

  const { invoke } = await import('@tauri-apps/api/core');
  const tauriConfig = await invoke<RuntimeConfig>('get_runtime_config');
  await waitForBackend(tauriConfig.apiBaseUrl);
  runtimeConfig = tauriConfig;

  return runtimeConfig;
};

export const getRuntimeConfig = () => runtimeConfig;
