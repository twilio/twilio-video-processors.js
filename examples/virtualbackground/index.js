'use strict';

const {
  Twilio: {
    Video,
    VideoProcessors: {
      GaussianBlurBackgroundProcessor,
      Pipeline: { WebGL2 },
      VirtualBackgroundProcessor,
      isSupported,
    },
  },
  bootstrap,
} = window;

const $errorMessage = document.querySelector('div.modal-body');
const $errorModal = new bootstrap.Modal(document.querySelector('div#errorModal'));
const $stats = document.querySelector('#stats');
const $videoInput = document.querySelector('video#video-input');

const params = {
  capFramerate: '24',
  capResolution: '640x480',
  debounce: 'no',
  pipeline: WebGL2,
  stats: 'show',
  ...Object.fromEntries(new URLSearchParams(location.search).entries())
};

const assetsPath = '';
const {
  capFramerate,
  capResolution,
  debounce,
  pipeline,
  stats,
} = params;

const addProcessorOptions = {
  inputFrameBufferType: 'video',
  outputFrameBufferContextType: pipeline === WebGL2 ? 'webgl2' : '2d',
};

const processorOptions = {
  assetsPath,
  debounce: debounce === 'yes',
  pipeline,
};

const capDimensions = capResolution.split('x').map(Number);

const captureConfig = {
  frameRate: Number(capFramerate),
  height: capDimensions[1],
  width: capDimensions[0],
};

let videoTrack;
let gaussianBlurProcessor;
let virtualBackgroundProcessor;

if(!isSupported){
  $errorMessage.textContent = 'This browser is not supported.';
  $errorModal.show();
}

const loadImage = (name) =>
  new Promise((resolve) => {
    const image = new Image();
    image.src = `backgrounds/${name}.jpg`;
    image.onload = () => resolve(image);
  });

Video.createLocalVideoTrack(captureConfig).then((track) => {
  track.attach($videoInput);
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

const handleButtonClick = async (bg) => {
  if (!gaussianBlurProcessor) {
    gaussianBlurProcessor = new GaussianBlurBackgroundProcessor(processorOptions);
    await gaussianBlurProcessor.loadModel();
  }
  if (!virtualBackgroundProcessor) {
    const backgroundImage = await loadImage('living_room');
    virtualBackgroundProcessor = new VirtualBackgroundProcessor({
      backgroundImage,
      ...processorOptions,
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

document.querySelectorAll('.img-btn').forEach(btn =>
  btn.onclick = () => handleButtonClick(btn.id));

if (stats === 'show') {
  $stats.style.display = 'block';
  setInterval(() => {
    if (!videoTrack) {
      return;
    }
    const { frameRate, height, width } = videoTrack.mediaStreamTrack.getSettings();
    $stats.innerText = `Capture dimensions (in): ${width} x ${height}`;
    $stats.innerText += `\nFrame rate (in): ${frameRate.toFixed(2)} fps`;

    if (!videoTrack.processor) {
      return;
    }
    const { processor: { _benchmark: b } } = videoTrack;    
    [
      ['Frame rate (out)', 'totalProcessingDelay', 'fps', 'getRate'],
      ['Capture delay', 'captureFrameDelay'],
      ['Resize delay', 'inputImageResizeDelay'],
      ['Segmentation delay ', 'segmentationDelay'],
      ['Composition delay', 'imageCompositionDelay'],
      ['Frame processing delay', 'processFrameDelay'],
      ['Total processing delay', 'totalProcessingDelay']
    ].forEach(([name, stat, unit = 'ms', getStat = 'getAverageDelay']) => {
      try {
        $stats.innerText += `\n${name}: ${b[getStat](stat).toFixed(2)} ${unit}`;
      } catch (e) {
        /* console.error(e); */
      }
    });
  }, 1000);
}
