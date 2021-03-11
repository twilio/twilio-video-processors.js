1.0.0 (In Progress)
===================

**Background Processors Pilot (Desktop Chrome only)**

You can now use `GaussianBlurBackgroundProcessor` to apply a Gaussian blur filter on the background of a video frame, or use `VirtualBackgroundProcessor` to replace the background with a given image.

  ```ts
  import { createLocalVideoTrack } from 'twilio-video';
  import {
    BackgroundProcessor,
    GaussianBlurBackgroundProcessor,
    VirtualBackgroundProcessor,
  } from '@twilio/video-processors';

  await BackgroundProcessor.loadModel();
  const blurBackground = new GaussianBlurBackgroundProcessor();
  const img = new Image();

  let virtualBackground;
  img.onload = () => {
    virtualBackground = new VirtualBackgroundProcessor({ backgroundImage: img });
  };
  img.src = 'https://image-path.jpg';

  const setProcessor = (track, processor) => {
    if (track.processor) {
      track.removeProcessor(track.processor);
    }
    track.addProcessor(processor);
  };

  createLocalVideoTrack({
    width: 640,
    height: 480
  }).then(track => {
    document.getElementById('preview').appendChild(track.attach());
    document.getElementById('blur-bg').onclick = () => setProcessor(track, blurBackground);
    document.getElementById('virtual-bg').onclick = () => setProcessor(track, virtualBackground);
  });
  ```
