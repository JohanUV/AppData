import { contextBridge, ipcRenderer } from 'electron';

// API mínima inicial. En fases siguientes se ampliará (DB, AI, settings).
const api = {
  platform: process.platform,
  versions: process.versions,
  invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
} as const;

contextBridge.exposeInMainWorld('datapath', api);

export type DatapathAPI = typeof api;
