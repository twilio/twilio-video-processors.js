'use strict';

const Video = Twilio.Video;
const { GaussianBlurBackgroundProcessor, VirtualBackgroundProcessor } = Twilio.VideoProcessors;

const gaussianBlurForm = document.querySelector('form#gaussianBlur-Form');
const gaussianBlurApply = document.querySelector('button#gaussianBlur-Apply');
const videoInput = document.querySelector('video#video-input');
let videoTrack;

Video.createLocalVideoTrack({
  width: 640,
  height: 480
}).then(track => {
  track.attach(videoInput);
  return videoTrack = track;
});

// Helper function to grab options for processors
const gaussianBlurProcessor = ({inferenceResolution, maskBlurRadius, blurFilterRadius}) => {
  const processor = new GaussianBlurBackgroundProcessor({inferenceResolution, maskBlurRadius, blurFilterRadius});
  return processor;
}

const virtualBackgroundProcessor = ({inferenceResolution, maskBlurRadius, backgroundImage, fitType}) => {

}

// Helper function to set processors
const setProcessor = (processor, track) => {
  if (track.processor) {
    track.removeProcessor(track.processor);
  }
  if (processor) {
    track.addProcessor(processor);
  }
}

gaussianBlurApply.onclick = (event) => {
  event.preventDefault();
  const options = {};
  const inputs = gaussianBlurForm.getElementsByTagName('input');
  for(let item of inputs) {
    options[item.id] = item.valueAsNumber;
  }

  const processor = gaussianBlurProcessor(options);
  setProcessor(processor, videoTrack);
}

// Load images here
const loadImage = name => new Promise(resolve => {
  const image = new Image();
  image.src = `./backgrounds/${name}.jpg`;
  image.onload = () => resolve(image);
});

Promise.all([
  loadImage('breaking-news'),
  loadImage('red-carpet'),
  loadImage('windows-field'),
]);
