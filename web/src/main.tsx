import './main.css';
import { loadRuntimeConfig } from './runtime';
import { LOCALE_KEY } from './storage-key.constant';

const detectLocale = () => {
  const storedLocale = localStorage.getItem(LOCALE_KEY);
  if (storedLocale === 'zh-CN' || storedLocale === 'en-US') {
    return storedLocale;
  }

  return navigator.language.toLowerCase().startsWith('en') ? 'en-US' : 'zh-CN';
};

const renderBootstrapError = (error: unknown) => {
  const root = document.getElementById('root');
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

try {
  await loadRuntimeConfig();
  const { mountApp } = await import('./bootstrap');

  mountApp();
} catch (error) {
  console.error('应用初始化失败:', error);
  renderBootstrapError(error);
}
