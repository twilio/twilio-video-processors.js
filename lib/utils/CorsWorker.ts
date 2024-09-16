declare function importScripts(path: string): any;

const fixWorkerBasePathForFetch = (basePath: string) => {
  const fetchOrig = fetch;
  // @ts-ignore
  fetch = (url: string, init?: RequestInit) => // eslint-disable-line no-global-assign
    fetchOrig(`${basePath}${url}`, init);
};

const fixWorkerBasePathForImportScripts = (basePath: string) => {
  const importScriptsOrig = importScripts;
  // @ts-ignore
  importScripts = (url: string) =>
    importScriptsOrig(`${basePath}${url}`);
};

export class CorsWorker {
  readonly workerPromise: Promise<Worker>;

  constructor(url: string) {
    if (!/:\/\//.test(url) || new RegExp(`^${window.location.origin}`).test(url)) {
      this.workerPromise = this._loadSameOrigin(url);
    } else {
      this.workerPromise = this._loadCrossOrigin(url);
    }
  }

  private async _loadCrossOrigin(url: string): Promise<Worker> {
    const response = await fetch(url);
    const code = await response.text();
    const type = 'application/javascript';
    const basePath = `${url.split('/').slice(0, -1).join('/')}/`;
    const dataUrl = [
      `data:${type},`,
      encodeURIComponent(`(${fixWorkerBasePathForFetch})("${basePath}");`),
      encodeURIComponent(`(${fixWorkerBasePathForImportScripts})("${basePath}");`),
      encodeURIComponent(code),
    ].join('');
    const dataBlob = new Blob([`importScripts("${dataUrl}")`], { type });
    const workerUrl = URL.createObjectURL(dataBlob);
    return new Worker(workerUrl);
  }

  private async _loadSameOrigin(url: string): Promise<Worker> {
    return new Worker(url);
  }
}
