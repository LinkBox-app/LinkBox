import './main.css';
import { loadRuntimeConfig, type RuntimeLoadStatus } from './runtime';
import { LOCALE_KEY } from './storage-key.constant';

const detectLocale = () => {
  const storedLocale = localStorage.getItem(LOCALE_KEY);
  if (storedLocale === 'zh-CN' || storedLocale === 'en-US') {
    return storedLocale;
  }

  return navigator.language.toLowerCase().startsWith('en') ? 'en-US' : 'zh-CN';
};

const getRoot = () => document.getElementById('root');

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const getStartupCopy = (locale: 'zh-CN' | 'en-US', status?: RuntimeLoadStatus) => {
  if (!status) {
    return locale === 'en-US'
      ? {
          eyebrow: 'Desktop Startup',
          title: 'Opening LinkBox',
          description: 'Preparing the application shell.',
          detail: 'Loading UI resources...',
        }
      : {
          eyebrow: '桌面启动中',
          title: '正在打开 LinkBox',
          description: '先把应用界面准备好。',
          detail: '正在加载界面资源...',
        };
  }

  const elapsedSeconds = Math.max(1, Math.round(status.elapsedMs / 1000));

  switch (status.phase) {
    case 'resolving-runtime':
      return locale === 'en-US'
        ? {
            eyebrow: 'Desktop Startup',
            title: 'Opening LinkBox',
            description: 'Reading desktop runtime configuration.',
            detail: 'Preparing the local service...',
          }
        : {
            eyebrow: '桌面启动中',
            title: '正在打开 LinkBox',
            description: '正在读取桌面运行配置。',
            detail: '准备本地服务环境...',
          };
    case 'waiting-for-backend':
      return locale === 'en-US'
        ? {
            eyebrow: 'Local Service',
            title: 'Starting the local backend',
            description:
              'The app is waiting for the bundled service to become available.',
            detail: `Attempt ${status.attempt} • ${elapsedSeconds}s elapsed`,
          }
        : {
            eyebrow: '本地服务启动中',
            title: '正在启动本地后端',
            description: '应用正在等待内置服务就绪。',
            detail: `第 ${status.attempt} 次检查 · 已等待 ${elapsedSeconds} 秒`,
          };
    case 'backend-ready':
      return locale === 'en-US'
        ? {
            eyebrow: 'Almost Ready',
            title: 'Opening LinkBox',
            description: 'The local service is ready.',
            detail: 'Rendering the application...',
          }
        : {
            eyebrow: '即将完成',
            title: '正在打开 LinkBox',
            description: '本地服务已经就绪。',
            detail: '正在渲染应用界面...',
          };
    case 'browser-ready':
      return locale === 'en-US'
        ? {
            eyebrow: 'Browser Mode',
            title: 'Opening LinkBox',
            description: 'Using the configured API endpoint.',
            detail: 'Rendering the application...',
          }
        : {
            eyebrow: '浏览器模式',
            title: '正在打开 LinkBox',
            description: '正在使用当前配置的 API 地址。',
            detail: '正在渲染应用界面...',
          };
  }
};

const renderStartupScreen = (status?: RuntimeLoadStatus) => {
  const root = getRoot();
  if (!root) {
    return;
  }

  const locale = detectLocale();
  const copy = getStartupCopy(locale, status);

  root.innerHTML = `
    <style>
      @keyframes linkbox-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    </style>
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:linear-gradient(135deg,#fff8e8 0%,#ffe9d1 100%);color:#130000;font-family:Menlo,Consolas,monospace;">
      <div style="width:min(100%,560px);border:2px solid #130000;background:rgba(255,255,255,0.92);box-shadow:8px 8px 0 #130000;padding:28px;">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;">
          <div style="width:22px;height:22px;border:3px solid rgba(19,0,0,0.18);border-top-color:#ff6f2e;border-radius:999px;animation:linkbox-spin 1s linear infinite;"></div>
          <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.72;">${escapeHtml(copy.eyebrow)}</div>
        </div>
        <h1 style="margin:0 0 12px;font-size:28px;line-height:1.1;">${escapeHtml(copy.title)}</h1>
        <p style="margin:0 0 10px;font-size:14px;line-height:1.6;">${escapeHtml(copy.description)}</p>
        <p style="margin:0;font-size:12px;line-height:1.6;opacity:0.72;">${escapeHtml(copy.detail)}</p>
      </div>
    </div>
  `;
};

const renderBootstrapError = (error: unknown) => {
  const root = getRoot();
  if (!root) {
    return;
  }

  const locale = detectLocale();
  const title =
    locale === 'en-US' ? 'LinkBox failed to start' : 'LinkBox 启动失败';
  const description =
    locale === 'en-US'
      ? 'The desktop app did not finish initializing.'
      : '桌面应用没有成功完成初始化。';

  root.innerHTML = `
    <div style="padding:24px;font-family:Menlo,Consolas,monospace;background:#fff8e8;color:#130000;min-height:100vh;">
      <h1 style="margin:0 0 12px;font-size:20px;">${title}</h1>
      <p style="margin:0 0 12px;">${description}</p>
      <pre style="white-space:pre-wrap;word-break:break-word;background:#fff;padding:12px;border:2px solid #130000;">${
        error instanceof Error ? error.message : String(error)
      }</pre>
    </div>
  `;
};

let hasMountedApp = false;

try {
  renderStartupScreen();
  const runtimeReadyPromise = loadRuntimeConfig({
    onStatus: (status) => {
      if (!hasMountedApp) {
        renderStartupScreen(status);
      }
    },
  });
  const { mountApp } = await import('./bootstrap');

  hasMountedApp = true;
  mountApp();
  await runtimeReadyPromise;
} catch (error) {
  console.error('应用初始化失败:', error);
  renderBootstrapError(error);
}
