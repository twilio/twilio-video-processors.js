'use strict';

const Video = Twilio.Video;
const { GaussianBlurBackgroundProcessor, VirtualBackgroundProcessor, isSupported, Pipeline } = Twilio.VideoProcessors;
const bootstrap = window.bootstrap;

const videoInput = document.querySelector('video#video-input');
const errorMessage = document.querySelector('div.modal-body');
const errorModal = new bootstrap.Modal(document.querySelector('div#errorModal'));
const stats = document.querySelector('#stats');

const $settingsPanel = document.querySelector('#settings-panel');
const $settingsToggle = document.querySelector('#settings-toggle');
const $maskBlurRadius = document.querySelector('#maskBlurRadius');
const $maskBlurRadiusValue = document.querySelector('#maskBlurRadiusValue');
const $blurFilterRadius = document.querySelector('#blurFilterRadius');
const $blurFilterRadiusValue = document.querySelector('#blurFilterRadiusValue');
const $fitType = document.querySelector('#fitType');
const $debounce = document.querySelector('#debounce');
const $pipeline = document.querySelector('#pipeline');
const $personProbabilityThreshold = document.querySelector('#personProbabilityThreshold');
const $personProbabilityThresholdValue = document.querySelector('#personProbabilityThresholdValue');
const $blurSettings = document.querySelector('.blur-settings');
const $fitTypeSettings = document.querySelector('.fit-type-settings');
const $sigmaSpace = document.querySelector('#sigmaSpace');
const $sigmaSpaceValue = document.querySelector('#sigmaSpaceValue');
const $sigmaColor = document.querySelector('#sigmaColor');
const $sigmaColorValue = document.querySelector('#sigmaColorValue');
const $webgl2Settings = document.querySelectorAll('.webgl2-settings');
const $canvas2dSettings = document.querySelectorAll('.canvas2d-settings');

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const params = Object.fromEntries(new URLSearchParams(location.search).entries());
const showStats = params.stats === 'true';

const assetsPath = '';
const getAddProcessorOptions = () => ({
  inputFrameBufferType: 'video',
  outputFrameBufferContextType: processorConfig.pipeline === Pipeline.WebGL2 ? 'webgl2' : '2d',
});
const captureConfig = {
  width: isSafari ? 640 : 1280,
  height: isSafari ? 480 : 720,
  frameRate: 24,
};

const processorConfig = {
  maskBlurRadius: 5,
  blurFilterRadius: 15,
  debounce: isSafari,
  pipeline: Pipeline.WebGL2,
  fitType: 'Fill',
  personProbabilityThreshold: 0.4,
  sigmaSpace: 10,
  sigmaColor: 0.12,
};

$debounce.checked = processorConfig.debounce;

videoInput.style.maxWidth = `${captureConfig.width}px`;

let videoTrack;
let gaussianBlurProcessor;
let virtualBackgroundProcessor;
let currentMode = 'none';
let currentBackground = null;

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
    track.addProcessor(processor, getAddProcessorOptions());
  }
};

const recreateProcessors = async () => {
  const wasBlur = currentMode === 'blur';
  const wasVirtualBg = currentMode !== 'none' && currentMode !== 'blur';

  if (videoTrack && videoTrack.processor) {
    videoTrack.removeProcessor(videoTrack.processor);
  }

  gaussianBlurProcessor = null;
  virtualBackgroundProcessor = null;

  if (wasBlur) {
    gaussianBlurProcessor = new GaussianBlurBackgroundProcessor({
      assetsPath,
      pipeline: processorConfig.pipeline,
      debounce: processorConfig.debounce,
      maskBlurRadius: processorConfig.maskBlurRadius,
      blurFilterRadius: processorConfig.blurFilterRadius,
      personProbabilityThreshold: processorConfig.personProbabilityThreshold,
    });
    await gaussianBlurProcessor.loadModel();
    setProcessor(gaussianBlurProcessor, videoTrack);
  } else if (wasVirtualBg && currentBackground) {
    const backgroundImage = await loadImage(currentBackground);
    virtualBackgroundProcessor = new VirtualBackgroundProcessor({
      assetsPath,
      backgroundImage,
      pipeline: processorConfig.pipeline,
      debounce: processorConfig.debounce,
      maskBlurRadius: processorConfig.maskBlurRadius,
      fitType: processorConfig.fitType,
      personProbabilityThreshold: processorConfig.personProbabilityThreshold,
      sigmaSpace: processorConfig.sigmaSpace,
      sigmaColor: processorConfig.sigmaColor,
    });
    await virtualBackgroundProcessor.loadModel();
    setProcessor(virtualBackgroundProcessor, videoTrack);
  }
};

const handleButtonClick = async bg => {
  currentMode = bg;

  if (bg === 'none') {
    setProcessor(null, videoTrack);
    $blurSettings.style.display = 'none';
    $fitTypeSettings.style.display = 'none';
  } else if (bg === 'blur') {
    if (!gaussianBlurProcessor) {
      gaussianBlurProcessor = new GaussianBlurBackgroundProcessor({
        assetsPath,
        pipeline: processorConfig.pipeline,
        debounce: processorConfig.debounce,
        maskBlurRadius: processorConfig.maskBlurRadius,
        blurFilterRadius: processorConfig.blurFilterRadius,
        personProbabilityThreshold: processorConfig.personProbabilityThreshold,
        sigmaSpace: processorConfig.sigmaSpace,
        sigmaColor: processorConfig.sigmaColor,
      });
      await gaussianBlurProcessor.loadModel();
    }
    setProcessor(gaussianBlurProcessor, videoTrack);
    $blurSettings.style.display = 'block';
    $fitTypeSettings.style.display = 'none';
  } else {
    currentBackground = bg;
    if (!virtualBackgroundProcessor) {
      const backgroundImage = await loadImage(bg);
      virtualBackgroundProcessor = new VirtualBackgroundProcessor({
        assetsPath,
        backgroundImage,
        pipeline: processorConfig.pipeline,
        debounce: processorConfig.debounce,
        maskBlurRadius: processorConfig.maskBlurRadius,
        fitType: processorConfig.fitType,
        personProbabilityThreshold: processorConfig.personProbabilityThreshold,
        sigmaSpace: processorConfig.sigmaSpace,
        sigmaColor: processorConfig.sigmaColor,
      });
      await virtualBackgroundProcessor.loadModel();
    } else {
      virtualBackgroundProcessor.backgroundImage = await loadImage(bg);
    }
    setProcessor(virtualBackgroundProcessor, videoTrack);
    $blurSettings.style.display = 'none';
    $fitTypeSettings.style.display = 'block';
  }
};

document.querySelectorAll('.img-btn').forEach(btn => btn.onclick = () => handleButtonClick(btn.id));

$settingsToggle.onclick = () => {
  $settingsPanel.classList.toggle('collapsed');
};

$maskBlurRadius.oninput = () => {
  const value = Number($maskBlurRadius.value);
  $maskBlurRadiusValue.textContent = value;
  processorConfig.maskBlurRadius = value;
  if (gaussianBlurProcessor) {
    gaussianBlurProcessor.maskBlurRadius = value;
  }
  if (virtualBackgroundProcessor) {
    virtualBackgroundProcessor.maskBlurRadius = value;
  }
};

$blurFilterRadius.oninput = () => {
  const value = Number($blurFilterRadius.value);
  $blurFilterRadiusValue.textContent = value;
  processorConfig.blurFilterRadius = value;
  if (gaussianBlurProcessor) {
    gaussianBlurProcessor.blurFilterRadius = value;
  }
};

$fitType.onchange = () => {
  processorConfig.fitType = $fitType.value;
  if (virtualBackgroundProcessor) {
    virtualBackgroundProcessor.fitType = $fitType.value;
  }
};

$personProbabilityThreshold.oninput = () => {
  const value = Number($personProbabilityThreshold.value) / 100;
  $personProbabilityThresholdValue.textContent = value.toFixed(2);
  processorConfig.personProbabilityThreshold = value;
};

$personProbabilityThreshold.onchange = () => {
  recreateProcessors();
};

$debounce.onchange = () => {
  processorConfig.debounce = $debounce.checked;
  recreateProcessors();
};

$pipeline.onchange = () => {
  processorConfig.pipeline = $pipeline.value === 'WebGL2' ? Pipeline.WebGL2 : Pipeline.Canvas2D;
  const isWebGL2 = processorConfig.pipeline === Pipeline.WebGL2;
  $webgl2Settings.forEach(el => el.style.display = isWebGL2 ? 'block' : 'none');
  $canvas2dSettings.forEach(el => el.style.display = isWebGL2 ? 'none' : 'block');
  recreateProcessors();
};

$sigmaSpace.oninput = () => {
  const value = Number($sigmaSpace.value);
  $sigmaSpaceValue.textContent = value;
  processorConfig.sigmaSpace = value;
  if (gaussianBlurProcessor) {
    gaussianBlurProcessor.sigmaSpace = value;
  }
  if (virtualBackgroundProcessor) {
    virtualBackgroundProcessor.sigmaSpace = value;
  }
};

$sigmaColor.oninput = () => {
  const value = Number($sigmaColor.value) / 100;
  $sigmaColorValue.textContent = value.toFixed(2);
  processorConfig.sigmaColor = value;
  if (gaussianBlurProcessor) {
    gaussianBlurProcessor.sigmaColor = value;
  }
  if (virtualBackgroundProcessor) {
    virtualBackgroundProcessor.sigmaColor = value;
  }
};

setInterval(() => {
  if (!videoTrack || !videoTrack.processor) {
    stats.style.display = 'none';
    return;
  }
  if (showStats) {
    stats.style.display = 'block';
  }
  const b = videoTrack.processor._benchmark;
  const inputFps = videoTrack.mediaStreamTrack.getSettings().frameRate;
  stats.innerText = `input fps: ${inputFps || 'N/A'}`;
  try {
    stats.innerText += `\noutput fps: ${b.getRate('totalProcessingDelay').toFixed(2)}`;
  } catch {
    stats.innerText += `\noutput fps: N/A`;
  }
  ['segmentationDelay', 'inputImageResizeDelay', 'imageCompositionDelay', 'processFrameDelay', 'captureFrameDelay'].forEach(stat => {
    try {
      stats.innerText += `\n${stat}: ${b.getAverageDelay(stat).toFixed(2)}`;
    } catch {

    }
  });
}, 1000);
