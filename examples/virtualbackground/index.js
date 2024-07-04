'use strict';

const { Video, VideoProcessors } = Twilio;
const { GaussianBlurBackgroundProcessor, VirtualBackgroundProcessor, isSupported, Pipeline } = VideoProcessors;
const { bootstrap, wasmFeatureDetect: { simd } } = window;

const videoInput = document.querySelector('video#video-input');
const errorMessage = document.querySelector('div.modal-body');
const errorModal = new bootstrap.Modal(document.querySelector('div#errorModal'));
const stats = document.querySelector('#stats');

const assetsPath = '';

const params = Object.fromEntries(new URLSearchParams(location.search).entries());
const showStats = params.stats === 'true';
const [width, height] = (params.videoRes || `1280x720`).split('x').map(Number);
const videoFps = Number(params.videoFps || '24');

const addProcessorOptions = {
  inputFrameBufferType: 'video',
  outputFrameBufferContextType: '2d',
};

const captureConfig = {
  width,
  height,
  frameRate: videoFps,
};

videoInput.style.maxWidth = `${captureConfig.width}px`;

let isWasmSimdSupported;
let videoTrack;
let gaussianBlurProcessor;
let virtualBackgroundProcessor;

if(!isSupported){
  errorMessage.textContent = 'This browser is not supported.';
  errorModal.show();
}

const loadImage = (name) =>
  new Promise((resolve) => {
    const image = new Image();
    image.src = `backgrounds/${name}.jpg`;
    image.onload = () => resolve(image);
  });

Video.createLocalVideoTrack(captureConfig).then((track) => {
  track.attach(videoInput);
  return videoTrack = track;
});

const setProcessor = (processor, track) => {
  if (track.processor) {
    track.removeProcessor(track.processor);
  }
  if (processor) {
    track.addProcessor(processor, addProcessorOptions);
  }
};

const handleButtonClick = async bg => {
  if (!gaussianBlurProcessor) {
    isWasmSimdSupported = await simd();
    gaussianBlurProcessor = new GaussianBlurBackgroundProcessor({
      assetsPath,
      debounce: !isWasmSimdSupported,
    });
    await gaussianBlurProcessor.loadModel();
  }
  if (!virtualBackgroundProcessor) {
    const backgroundImage = await loadImage('living_room');
    virtualBackgroundProcessor = new VirtualBackgroundProcessor({
      assetsPath,
      backgroundImage,
      debounce: !isWasmSimdSupported,
    });
    await virtualBackgroundProcessor.loadModel();
  }
  if (bg === 'none') {
    setProcessor(null, videoTrack);
  } else if (bg === 'blur') {
    setProcessor(gaussianBlurProcessor, videoTrack);
  } else {
    virtualBackgroundProcessor.backgroundImage = await loadImage(bg);
    setProcessor(virtualBackgroundProcessor, videoTrack);
  }
};

document.querySelectorAll('.img-btn').forEach(btn => btn.onclick = () => handleButtonClick(btn.id));

setInterval(() => {
  if (!videoTrack || !videoTrack.processor) {
    stats.style.display = 'none';
    return;
  }
  if (showStats) {
    stats.style.display = 'block';
  }
  const b = videoTrack.processor._benchmark;
  stats.innerText = `input fps: ${videoTrack.mediaStreamTrack.getSettings().frameRate}`;
  stats.innerText += `\noutput fps: ${b.getRate('totalProcessingDelay').toFixed(2)}`;
  ['segmentationDelay', 'inputImageResizeDelay', 'imageCompositionDelay', 'processFrameDelay', 'captureFrameDelay'].forEach(stat => {
    try {
      stats.innerText += `\n${stat}: ${b.getAverageDelay(stat).toFixed(2)}`;
    } catch {

    }
  });
}, 1000);
