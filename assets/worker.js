importScripts('https://unpkg.com/comlink/dist/umd/comlink.js');

let inferenceData = null;
let isSimdEnabled = true;
let tflite = null;

async function loadTwilioTFLite({
  assetsPath,
  tfliteLoaderName,
  tfliteSimdLoaderName,
}) {
  try {
    importScripts(`${assetsPath}${tfliteSimdLoaderName}`);
    tflite = await createTwilioTFLiteSIMDModule();
    isSimdEnabled = true;
  } catch {
    console.warn('SIMD not supported. You may experience poor quality of background replacement.');
    importScripts(`${assetsPath}${tfliteLoaderName}`);
    tflite = await createTwilioTFLiteModule();
    isSimdEnabled = false;
  }
}

async function _initialize({
  assetsPath,
  modelName,
  tfliteLoaderName,
  tfliteSimdLoaderName,
}) {
  if (tflite) {
    return;
  }
  const [, modelResponse] = await Promise.all([
    loadTwilioTFLite({
      assetsPath,
      tfliteLoaderName,
      tfliteSimdLoaderName,
    }),
    fetch(`${assetsPath}${modelName}`),
  ]);
  const model = await modelResponse.arrayBuffer();
  const modelBufferOffset = tflite._getModelBufferMemoryOffset();
  tflite.HEAPU8.set(new Uint8Array(model), modelBufferOffset);
  tflite._loadModel(model.byteLength);
  return isSimdEnabled;
}

function _runInference(imageBuffer) {
  const height = tflite._getInputHeight();
  const width = tflite._getInputWidth();
  const pixels = width * height;
  const tfliteInputMemoryOffset = tflite._getInputMemoryOffset() / 4;
  const tfliteOutputMemoryOffset = tflite._getOutputMemoryOffset() / 4;

  for (let i = 0; i < pixels; i++) {
    const curTFLiteOffset = tfliteInputMemoryOffset + i * 3;
    const curImageBufferOffset = i * 4;
    tflite.HEAPF32[curTFLiteOffset] = imageBuffer[curImageBufferOffset] / 255;
    tflite.HEAPF32[curTFLiteOffset + 1] = imageBuffer[curImageBufferOffset + 1] / 255;
    tflite.HEAPF32[curTFLiteOffset + 2] = imageBuffer[curImageBufferOffset + 2] / 255;
  }

  tflite._runInference();

  inferenceData = inferenceData || new Uint8ClampedArray(pixels);
  for (let i = 0; i < pixels; i++) {
    inferenceData[i] = Math.round(tflite.HEAPF32[tfliteOutputMemoryOffset + i] * 255);
  }
  return inferenceData;
}

Comlink.expose({
  _initialize,
  _runInference,
});
