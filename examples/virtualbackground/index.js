'use strict';

const Video = Twilio.Video;
const {GaussianBlurBackgroundProcessor, VirtualBackgroundProcessor} = Twilio.VideoProcessors;

const gaussianBlurForm = document.querySelector('form#gaussianBlur-Form');
const gaussianBlurButton = document.querySelector('button#gaussianBlur-Apply');
const virtualBackgroundForm = document.querySelector('form#virtualBackground-Form');
const virtualBackgroundButton = document.querySelector('button#virtualBackground-Apply');
const videoInput = document.querySelector('video#video-input');
const removeProcessorButton = document.querySelector('button#no-processor-apply');
const modelUrl = 'model-selfiesegmentation_mlkit-256x256-2021_01_19-v1215.f16.tflite';
let videoTrack;
let gaussianBlurProcessor;
let virtualBackgroundProcessor;

const loadImage = (name) =>
  new Promise((resolve) => {
    const image = new Image();
    image.src = `backgrounds/${name}.jpg`;
    image.onload = () => resolve(image);
  });

let images = {};
Promise.all([
  loadImage('breaking-news'),
  loadImage('red-carpet'),
  loadImage('windows-field'),
]).then(([breakingNews, redCarpet, windowsField]) => {
  images.breakingNews = breakingNews;
  images.redCarpet = redCarpet;
  images.windowsField = windowsField;
  return images;
});

Video.createLocalVideoTrack({
  width: 640,
  height: 480,
  frameRate: 15,
}).then((track) => {
  track.attach(videoInput);
  return videoTrack = track;
});

// Adding processor to Video Track
const setProcessor = (processor, track) => {
  if (track.processor) {
    removeProcessorButton.disabled = true;
    track.removeProcessor(track.processor);
  }
  if (processor) {
    removeProcessorButton.disabled = false;
    track.addProcessor(processor);
  }
};

gaussianBlurButton.onclick = async event => {
  event.preventDefault();
  const options = {};
  const inputs = gaussianBlurForm.getElementsByTagName('input');
  for (let item of inputs) {
    options[item.id] = item.valueAsNumber;
  }
  const { maskBlurRadius, blurFilterRadius } = options;
  if (!gaussianBlurProcessor) {
    gaussianBlurProcessor = new GaussianBlurBackgroundProcessor({
      modelUrl,
      maskBlurRadius,
      blurFilterRadius,
    });
    await gaussianBlurProcessor.loadModel();
  } else {
    gaussianBlurProcessor.maskBlurRadius = maskBlurRadius;
    gaussianBlurProcessor.blurFilterRadius = blurFilterRadius;
  }
  setProcessor(gaussianBlurProcessor, videoTrack);
};

virtualBackgroundButton.onclick = async event => {
  event.preventDefault();
  const options = {};
  const inputs = virtualBackgroundForm.elements;
  for (let item of inputs) {
    item.valueAsNumber
      ? (options[item.id] = item.valueAsNumber)
      : (options[item.id] = item.value);
  }
  let backgroundImage = images[options.backgroundImage];
  let { maskBlurRadius, fitType } = options;
  if (!virtualBackgroundProcessor) {
    virtualBackgroundProcessor = new VirtualBackgroundProcessor({
      modelUrl,
      maskBlurRadius,
      backgroundImage,
      fitType,
    });
    await virtualBackgroundProcessor.loadModel();
  } else {
    virtualBackgroundProcessor.backgroundImage = backgroundImage;
    virtualBackgroundProcessor.fitType = fitType;
    virtualBackgroundProcessor.maskBlurRadius = maskBlurRadius;
  }
  setProcessor(virtualBackgroundProcessor, videoTrack);
};

removeProcessorButton.disabled = true;
removeProcessorButton.onclick = event => {
  event.preventDefault();
  setProcessor(null, videoTrack);
};
