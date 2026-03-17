import { getRuntimeConfig } from '../runtime';

export const openExternal = async (url: string) => {
  if (getRuntimeConfig().isDesktop) {
    const { openUrl } = await import('@tauri-apps/plugin-opener');
    await openUrl(url);
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
};
