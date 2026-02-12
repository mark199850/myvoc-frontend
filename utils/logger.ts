const showLogs = import.meta.env
  ? import.meta.env.DEV
  : process.env.NODE_ENV === "development";

const getAppName = () => {
  try {
    const extApi = (globalThis as any).browser || (globalThis as any).chrome;

    if (extApi && extApi.runtime && extApi.runtime.getManifest) {
      return extApi.runtime.getManifest().name;
    }
  } catch (e) {}
  return "MyVoc";
};

const isWorker = typeof window === "undefined" && typeof self !== "undefined";

const appName = getAppName();
const prefix = isWorker ? `[${appName}:Worker]` : `[${appName}]`;

export const logger = {
  debug: (msg: string, ...args: any[]) => {
    if (!showLogs) return;
    console.debug(`${prefix} ${msg}`, ...args);
  },

  error: (msg: string, ...args: any[]) => {
    console.error(`${prefix} ${msg}`, ...args);
  },
};
