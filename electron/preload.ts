import { contextBridge, ipcRenderer } from 'electron';

const api = {
  platform: process.platform,
  versions: process.versions,

  user: { current: () => ipcRenderer.invoke('user:current') },
  stats: { get: () => ipcRenderer.invoke('stats:get') },
  badges: {
    list: () => ipcRenderer.invoke('badges:list'),
    check: () => ipcRenderer.invoke('badges:check'),
  },
  heatmap: { get: (days?: number) => ipcRenderer.invoke('heatmap:get', days) },
  activity: { recent: (limit?: number) => ipcRenderer.invoke('activity:recent', limit) },
  xp: {
    award: (payload: { amount: number; reason?: string; seconds?: number }) =>
      ipcRenderer.invoke('xp:award', payload),
  },
  lesson: {
    complete: (payload: {
      lessonSlug: string;
      xp: number;
      score?: number;
      timeSpentSeconds?: number;
    }) => ipcRenderer.invoke('lesson:complete', payload),
  },
  locale: { track: (locale: string) => ipcRenderer.invoke('locale:track', locale) },

  // ── Tutor IA ──
  ai: {
    encryptionAvailable: () => ipcRenderer.invoke('ai:encryption-available'),
    getSettings: () => ipcRenderer.invoke('ai:settings:get'),
    saveSettings: (patch: Record<string, unknown>) =>
      ipcRenderer.invoke('ai:settings:save', patch),

    saveKey: (payload: { provider: string; key: string; customEndpoint?: string }) =>
      ipcRenderer.invoke('ai:key:save', payload),
    deleteKey: (provider: string) => ipcRenderer.invoke('ai:key:delete', provider),
    configuredProviders: () => ipcRenderer.invoke('ai:key:configured'),
    validateKey: (payload: { provider: string; key: string; customEndpoint?: string }) =>
      ipcRenderer.invoke('ai:key:validate', payload),

    usageToday: () => ipcRenderer.invoke('ai:usage:today'),
    fallbackLogs: () => ipcRenderer.invoke('ai:fallback:logs'),

    getConversation: (lessonSlug: string) =>
      ipcRenderer.invoke('ai:conversation:get', lessonSlug),
    clearConversation: (lessonSlug: string) =>
      ipcRenderer.invoke('ai:conversation:clear', lessonSlug),

    startChat: (payload: {
      streamId: string;
      lessonSlug: string;
      systemPrompt: string;
      userMessage: string;
      forceProvider?: string;
    }) => ipcRenderer.invoke('ai:chat:start', payload),
    cancelChat: (streamId: string) => ipcRenderer.invoke('ai:chat:cancel', streamId),

    /** Suscribe un listener al canal del stream. Devuelve la función de unsubscribe. */
    onChunk: (streamId: string, callback: (payload: unknown) => void) => {
      const channel = `ai:chunk:${streamId}`;
      const listener = (_event: unknown, payload: unknown) => callback(payload);
      ipcRenderer.on(channel, listener);
      return () => ipcRenderer.removeListener(channel, listener);
    },
  },
} as const;

contextBridge.exposeInMainWorld('datapath', api);

export type DatapathAPI = typeof api;
