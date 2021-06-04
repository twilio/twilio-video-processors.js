'use strict';

const Video = Twilio.Video;
const { GaussianBlurBackgroundProcessor, VirtualBackgroundProcessor, isSupported } = Twilio.VideoProcessors;
const bootstrap = window.bootstrap;

const gaussianBlurForm = document.querySelector('form#gaussianBlur-Form');
const gaussianBlurButton = document.querySelector('button#gaussianBlur-Apply');
const virtualBackgroundForm = document.querySelector('form#virtualBackground-Form');
const virtualBackgroundButton = document.querySelector('button#virtualBackground-Apply');
const videoInput = document.querySelector('video#video-input');
const removeProcessorButton = document.querySelector('button#no-processor-apply');
const errorMessage = document.querySelector('div.modal-body');
const errorModal = new bootstrap.Modal(document.querySelector('div#errorModal'));

// Same directory as the current js file
const assetsPath = '';

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

let images = {};
Promise.all([
  loadImage('living_room'),
  loadImage('office'),
  loadImage('vacation'),
]).then(([livingRoom, office, vacation]) => {
  images.livingRoom = livingRoom;
  images.office = office;
  images.vacation = vacation;
  return images;
});

Video.createLocalVideoTrack({
  width: 1280,
  height: 720,
  frameRate: 24,
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
      assetsPath,
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
      assetsPath,
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
