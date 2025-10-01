declare const WorkerGlobalScope: any;
declare function createTwilioTFLiteModule(): Promise<any>;
declare function createTwilioTFLiteSIMDModule(): Promise<any>;
declare function importScripts(path: string): any;

const isWebWorker = typeof WorkerGlobalScope !== 'undefined'
  && self instanceof WorkerGlobalScope;

const loadedScripts = new Set<string>();
let model: ArrayBuffer;

/**
 * @private
 */
export class TwilioTFLite {
  private _inputBuffer: Uint8ClampedArray | null = null;
  private _isSimdEnabled: boolean | null = null;
  private _tflite: any = null;

  get isSimdEnabled(): boolean | null {
    return this._isSimdEnabled;
  }

  async initialize(
    assetsPath: string,
    modelName: string,
    moduleLoaderName: string,
    moduleSimdLoaderName: string,
  ): Promise<void> {
    if (this._tflite) {
      return;
    }
    if (isWebWorker) {
      // NOTE(mmalavalli): In a web worker, paths to other dependencies
      // are determined relative to the assets path, so no need to append
      // it to the file names of the dependencies.
      assetsPath = '';
    }
    const [, modelResponse]: [void, Response] = await Promise.all([
      this._loadWasmModule(
        assetsPath,
        moduleLoaderName,
        moduleSimdLoaderName,
      ),
      fetch(`${assetsPath}${modelName}`),
    ]);
    model = model || await modelResponse.arrayBuffer();
    const { _tflite: tflite } = this;
    const modelBufferOffset = tflite._getModelBufferMemoryOffset();
    tflite.HEAPU8.set(new Uint8Array(model), modelBufferOffset);
    tflite._loadModel(model.byteLength);
  }

  loadInputBuffer(inputBuffer: Uint8ClampedArray): void {
    const { _tflite: tflite } = this;
    const height = tflite._getInputHeight();
    const width = tflite._getInputWidth();
    const pixels = width * height;
    const tfliteInputMemoryOffset = tflite._getInputMemoryOffset() / 4;

    for (let i = 0; i < pixels; i++) {
      const curTFLiteOffset = tfliteInputMemoryOffset + i * 3;
      const curImageBufferOffset = i * 4;
      tflite.HEAPF32[curTFLiteOffset] = inputBuffer[curImageBufferOffset] / 255;
      tflite.HEAPF32[curTFLiteOffset + 1] = inputBuffer[curImageBufferOffset + 1] / 255;
      tflite.HEAPF32[curTFLiteOffset + 2] = inputBuffer[curImageBufferOffset + 2] / 255;
    }
    this._inputBuffer = inputBuffer;
  }

  runInference(): Uint8ClampedArray {
    const { _tflite: tflite } = this;
    const height = tflite._getInputHeight();
    const width = tflite._getInputWidth();
    const pixels = width * height;
    const tfliteOutputMemoryOffset = tflite._getOutputMemoryOffset() / 4;

    tflite._runInference();

    const outputBuffer = this._inputBuffer || new Uint8ClampedArray(pixels * 4);
    for (let i = 0; i < pixels; i++) {
      // Use the output of the inference to control the alpha channel of the buffer which would result in a person mask
      // with certains pixels being transparent, semi-transparent or opaque based on the confidence of the model.
      outputBuffer[i * 4 + 3] = Math.round(tflite.HEAPF32[tfliteOutputMemoryOffset + i] * 255);
    }
    return outputBuffer;
  }

  private async _loadScript(path: string): Promise<void> {
    if (loadedScripts.has(path)) {
      return;
    }
    if (isWebWorker) {
      importScripts(path);
      loadedScripts.add(path);
      return;
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.onload = () => {
        loadedScripts.add(path);
        resolve();
      };
      script.onerror = () => {
        reject();
      };
      document.head.append(script);
      script.src = path;
    });
  }

  private async _loadWasmModule(
    assetsPath: string,
    moduleLoaderName: string,
    moduleSimdLoaderName: string,
  ): Promise<void> {
    try {
      await this._loadScript(`${assetsPath}${moduleSimdLoaderName}`);
      this._tflite = await createTwilioTFLiteSIMDModule();
      this._isSimdEnabled = true;
    } catch {
      await this._loadScript(`${assetsPath}${moduleLoaderName}`);
      this._tflite = await createTwilioTFLiteModule();
      this._isSimdEnabled = false;
    }
  }
}
