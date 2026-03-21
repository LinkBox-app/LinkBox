import { LOCALE_KEY } from './storage-key.constant';

const DEFAULT_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:7032';
const BACKEND_STARTUP_TIMEOUT_MS = 30_000;
const BACKEND_HEALTHCHECK_INTERVAL_MS = 300;
const BACKEND_HEALTHCHECK_REQUEST_TIMEOUT_MS = 1_500;

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

const delay = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

const waitForBackend = async (apiBaseUrl: string) => {
  const deadline = Date.now() + BACKEND_STARTUP_TIMEOUT_MS;
  let lastError: unknown = null;

  while (Date.now() < deadline) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      BACKEND_HEALTHCHECK_REQUEST_TIMEOUT_MS
    );

    try {
      const response = await fetch(`${apiBaseUrl}/health`, {
        cache: 'no-store',
        signal: controller.signal,
      });

      if (response.ok) {
        window.clearTimeout(timeoutId);
        return;
      }

      lastError = new Error(`Health check returned ${response.status}`);
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error('Health check request failed');
    } finally {
      window.clearTimeout(timeoutId);
    }

    await delay(BACKEND_HEALTHCHECK_INTERVAL_MS);
  }

  const seconds = Math.round(BACKEND_STARTUP_TIMEOUT_MS / 1000);
  const detail = lastError instanceof Error ? ` (${lastError.message})` : '';

  throw new Error(
    detectLocale() === 'en-US'
      ? `Timed out after ${seconds}s while waiting for the desktop backend to start${detail}`
      : `等待桌面端后端服务启动超时（${seconds} 秒）${detail}`
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
