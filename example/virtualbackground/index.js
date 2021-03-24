'use strict';

const Video = Twilio.Video;
const { GaussianBlurBackgroundProcessor, VirtualBackgroundProcessor } = Twilio.VideoProcessors;

const gaussianBlurForm = document.querySelector('form#gaussianBlur-Form');
const gaussianBlurButton = document.querySelector('button#gaussianBlur-Apply');
const virtualBackgroundForm = document.querySelector('form#virtualBackground-Form');
const virtualBackgroundButton = document.querySelector('button#virtualBackground-Apply');
const videoInput = document.querySelector('video#video-input');
let videoTrack;

// Load images here
const loadImage = name => new Promise(resolve => {
  const image = new Image();
  image.src = `./backgrounds/${name}.jpg`;
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
  height: 480
}).then(track => {
  track.attach(videoInput);
  return videoTrack = track;
});

// Helper function to grab options for processors
const gaussianBlurProcessor = (options) => {
  const processor = new GaussianBlurBackgroundProcessor(options);
  return processor;
}

const virtualBackgroundProcessor = ({inferenceResolution, maskBlurRadius, backgroundImageStr, fitType}) => {
  let backgroundImage = images[backgroundImageStr];
  const processor = new VirtualBackgroundProcessor({inferenceResolution, maskBlurRadius, backgroundImage, fitType});
  return processor;
}

const setProcessor = (processor, track) => {
  if (track.processor) {
    track.removeProcessor(track.processor);
  }
  if (processor) {
    track.addProcessor(processor);
  }
}

gaussianBlurButton.onclick = event => {
  event.preventDefault();
  const options = {};
  const inputs = gaussianBlurForm.getElementsByTagName('input');
  for(let item of inputs) {
    options[item.id] = item.valueAsNumber;
  }

  const processor = gaussianBlurProcessor(options);
  setProcessor(processor, videoTrack);
}

virtualBackgroundButton.onclick = event => {
  event.preventDefault();
  const options = {};
  const inputs = virtualBackgroundForm.elements
  for(let item of inputs) {
    item.valueAsNumber ? options[item.id] = item.valueAsNumber : options[item.id] = item.value;
  }

  const processor = virtualBackgroundProcessor(options);
  setProcessor(processor, videoTrack);
}