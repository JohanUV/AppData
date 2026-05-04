import { contextBridge, ipcRenderer } from 'electron';

const api = {
  platform: process.platform,
  versions: process.versions,

  user: {
    current: () => ipcRenderer.invoke('user:current'),
  },
  stats: {
    get: () => ipcRenderer.invoke('stats:get'),
  },
  badges: {
    list: () => ipcRenderer.invoke('badges:list'),
    check: () => ipcRenderer.invoke('badges:check'),
  },
  heatmap: {
    get: (days?: number) => ipcRenderer.invoke('heatmap:get', days),
  },
  activity: {
    recent: (limit?: number) => ipcRenderer.invoke('activity:recent', limit),
  },
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
  locale: {
    track: (locale: string) => ipcRenderer.invoke('locale:track', locale),
  },
} as const;

contextBridge.exposeInMainWorld('datapath', api);

export type DatapathAPI = typeof api;
