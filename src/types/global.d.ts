export interface DatapathAPI {
  readonly platform: NodeJS.Platform;
  readonly versions: NodeJS.ProcessVersions;
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
}

declare global {
  interface Window {
    datapath: DatapathAPI;
  }
}
