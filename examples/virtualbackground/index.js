const { bootstrap } = window;

const $backgrounds = document.querySelector('#backgrounds');
const $errorMessage = document.querySelector('div.modal-body');
const $errorModal = new bootstrap.Modal(document.querySelector('div#errorModal'));
const $stats = document.querySelector('#stats');
const $videoInput = document.querySelector('video#video-input');
const $settingsPanel = document.querySelector('#settings-panel');
const $settingsToggle = document.querySelector('#settings-toggle');
const $settingsContent = document.querySelector('#settings-content');
const $maskBlurRadius = document.querySelector('#maskBlurRadius');
const $maskBlurRadiusValue = document.querySelector('#maskBlurRadiusValue');
const $sigmaColor = document.querySelector('#sigmaColor');
const $sigmaColorValue = document.querySelector('#sigmaColorValue');
const $skipPostProcessing = document.querySelector('#skipPostProcessing');
const $hysteresisEnabled = document.querySelector('#hysteresisEnabled');
const $hysteresisLow = document.querySelector('#hysteresisLow');
const $hysteresisLowValue = document.querySelector('#hysteresisLowValue');
const $hysteresisHigh = document.querySelector('#hysteresisHigh');
const $hysteresisHighValue = document.querySelector('#hysteresisHighValue');
const $fitType = document.querySelector('#fitType');
const $modelType = document.querySelector('#modelType');
const $bilateralFilterType = document.querySelector('#bilateralFilterType');
const $hysteresisSettings = document.querySelectorAll('.hysteresis-settings');
const $fitTypeSettings = document.querySelector('.fit-type-settings');

const assetsPath = '';
const bkgImages = new Map();

const defaultParams = {
  blurFilterRadius: '15',
  capFramerate: '30',
  capResolution: '1280x720',
  deferInputFrameDownscale: 'false',
  maskBlurRadius: '8',
  stats: 'show',
  useWebWorker: 'true',
};

const params = {
  ...defaultParams,
  ...Object.fromEntries(
    new URLSearchParams(location.search)
      .entries()
  )
};

const promisifyLoader = (
  $element,
  src,
) => new Promise((resolve, reject) => {
  $element.src = src;
  $element.onload = () => resolve($element);
  $element.onerror = reject;
});

const loadImage = async (name) => {
  const bkgImage = bkgImages.get(name) || await promisifyLoader(
    new Image(),
    `backgrounds/${name}.jpg`,
    false,
  );
  bkgImages.set(name, bkgImage);
  return bkgImage;
}

(async ({
  Video: { createLocalVideoTrack },
  VideoProcessors: {
    GaussianBlurBackgroundProcessor,
    VirtualBackgroundProcessor,
    isSupported,
    version,
  },
}) => {
  const {
    blurFilterRadius,
    capFramerate,
    capResolution,
    deferInputFrameDownscale,
    maskBlurRadius,
    stats,
    useWebWorker,
  } = params;

  const addProcessorOptions = {
    inputFrameBufferType: 'videoframe',
    outputFrameBufferContextType: 'bitmaprenderer',
  };

  const capDimensions = capResolution
    .split('x')
    .map(Number);

  const captureConfig = {
    frameRate: Number(capFramerate),
    height: capDimensions[1],
    width: capDimensions[0],
  };

  const processorOptions = {
    assetsPath,
    deferInputFrameDownscale: JSON.parse(deferInputFrameDownscale),
    maskBlurRadius: Number(maskBlurRadius),
    useWebWorker: JSON.parse(useWebWorker),
  };

  let videoTrack = null;
  let gaussianBlurProcessor = null;
  let virtualBackgroundProcessor = null;

  if(!isSupported) {
    $errorMessage.textContent = 'This browser is not supported.';
    $errorModal.show();
  }

  videoTrack = await createLocalVideoTrack(captureConfig);
  videoTrack.attach($videoInput);

  $backgrounds.style.left = `${
    $videoInput.clientLeft
    + captureConfig.width
    - $backgrounds.clientWidth
    - 5
  }px`;

  const setProcessor = (track, processor) => {
    if (track.processor === processor) {
      return;
    }
    if (track.processor) {
      track.removeProcessor(track.processor);
    }
    if (processor) {
      track.addProcessor(processor, addProcessorOptions);
    }
  };

  let handleButtonClick = async (bg) => {
    if (bg === 'none') {
      setProcessor(videoTrack, null);
    } else if (bg === 'blur') {
      if (!gaussianBlurProcessor) {
        gaussianBlurProcessor = new GaussianBlurBackgroundProcessor({
          blurFilterRadius: Number(blurFilterRadius),
          ...processorOptions,
        });
        await gaussianBlurProcessor.loadModel();
      }
      setProcessor(videoTrack, gaussianBlurProcessor);
    } else {
      if (!virtualBackgroundProcessor) {
        virtualBackgroundProcessor = new VirtualBackgroundProcessor({
          backgroundImage: await loadImage(bg),
          ...processorOptions,
        });
        await virtualBackgroundProcessor.loadModel();
      } else {
        virtualBackgroundProcessor.backgroundImage = await loadImage(bg);
      }
      setProcessor(videoTrack, virtualBackgroundProcessor);
    }
  };

  $backgrounds.querySelectorAll('.img-btn').forEach((btn) =>
    btn.onclick = () => handleButtonClick(btn.id));

  if (stats === 'advanced' || stats === 'show') {
    $stats.style.display = 'block';
    setInterval(async () => {
      if (!videoTrack) {
        return;
      }
      const { frameRate, height, width } = videoTrack.mediaStreamTrack.getSettings();
      $stats.innerText = `Sdk version: ${version}`;
      $stats.innerText += `\nCapture dimensions (in): ${width} x ${height}`;
      $stats.innerText += `\nFrame rate (in): ${frameRate.toFixed(2)} fps`;

      if (!videoTrack.processor) {
        return;
      }
      const { processor: { _benchmark: b } } = videoTrack;
      [
        ['Frame rate (out)', 'totalProcessingDelay', 'fps', 'getRate'],
        ...(stats === 'show' ? [] : [
          ['Capture delay', 'captureFrameDelay'],
          ['Resize delay', 'inputImageResizeDelay'],
          ['Segmentation delay ', 'segmentationDelay'],
          ['Composition delay', 'imageCompositionDelay'],
          ['Frame processing delay', 'processFrameDelay'],
          ['Total processing delay', 'totalProcessingDelay'],
        ])
      ].forEach(([name, stat, unit = 'ms', getStat = 'getAverageDelay']) => {
        try {
          $stats.innerText += `\n${name}: ${b[getStat](stat).toFixed(2)} ${unit}`;
        } catch {
          /* noop */
        }
      });
    }, 1000);
  }

  $settingsToggle.onclick = () => {
    $settingsPanel.classList.toggle('collapsed');
  };

  const getActiveProcessor = () => gaussianBlurProcessor || virtualBackgroundProcessor;

  $maskBlurRadius.oninput = () => {
    const value = Number($maskBlurRadius.value);
    $maskBlurRadiusValue.textContent = value;
    const processor = getActiveProcessor();
    if (processor) {
      processor.maskBlurRadius = value;
    }
  };

  $sigmaColor.oninput = () => {
    const value = Number($sigmaColor.value) / 100;
    $sigmaColorValue.textContent = value.toFixed(2);
    const processor = getActiveProcessor();
    if (processor) {
      processor.sigmaColor = value;
    }
  };

  $skipPostProcessing.onchange = () => {
    const processor = getActiveProcessor();
    if (processor) {
      processor.skipPostProcessing = $skipPostProcessing.checked;
    }
  };

  $hysteresisEnabled.onchange = () => {
    const enabled = $hysteresisEnabled.checked;
    $hysteresisSettings.forEach(el => {
      el.style.display = enabled ? 'block' : 'none';
    });
    const processor = getActiveProcessor();
    if (processor) {
      processor.hysteresisEnabled = enabled;
    }
  };

  $hysteresisLow.oninput = () => {
    const value = Number($hysteresisLow.value);
    $hysteresisLowValue.textContent = value;
    const processor = getActiveProcessor();
    if (processor) {
      processor.hysteresisLow = value;
    }
  };

  $hysteresisHigh.oninput = () => {
    const value = Number($hysteresisHigh.value);
    $hysteresisHighValue.textContent = value;
    const processor = getActiveProcessor();
    if (processor) {
      processor.hysteresisHigh = value;
    }
  };

  $fitType.onchange = () => {
    if (virtualBackgroundProcessor) {
      virtualBackgroundProcessor.fitType = $fitType.value;
    }
  };

  $modelType.onchange = () => {
    const processor = getActiveProcessor();
    if (processor) {
      processor.modelType = $modelType.value;
    }
  };

  $bilateralFilterType.onchange = () => {
    const processor = getActiveProcessor();
    if (processor) {
      processor.bilateralFilterType = $bilateralFilterType.value;
    }
  };

  const originalHandleButtonClick = handleButtonClick;
  handleButtonClick = async (bg) => {
    await originalHandleButtonClick(bg);
    const isVirtualBackground = bg !== 'none' && bg !== 'blur';
    $fitTypeSettings.style.display = isVirtualBackground ? 'block' : 'none';
  };

  window.videoTrack = videoTrack;
})(Twilio);
