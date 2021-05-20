1.0.0-beta.3 (In Progress)
===================

Improvements
------------

* The Video Processors now uses WebAssembly to run TensorFlow Lite for a faster and more accurate inference. You need to serve the tflite model and binaries so you can reference them from your application. See [assets](README.md#assets) section for details.

1.0.0-beta.2 (April 16, 2021)
===================

Improvements
------------

* The background processors now stabilize the boundary of the foreground (person), thereby reducing the 'shakiness' effect.


1.0.0-beta1 (March 31, 2021)
===================

**Background Processors (Desktop Chrome only)**

You can now use `GaussianBlurBackgroundProcessor` to apply a Gaussian blur filter on the background of a video frame, or use `VirtualBackgroundProcessor` to replace the background with a given image.

  ```ts
  import { createLocalVideoTrack } from 'twilio-video';
  import {
    GaussianBlurBackgroundProcessor,
    VirtualBackgroundProcessor,
  } from '@twilio/video-processors';

  const blurBackground = new GaussianBlurBackgroundProcessor();
  const img = new Image();

  let virtualBackground;
  img.onload = () => {
    virtualBackground = new VirtualBackgroundProcessor({ backgroundImage: img });
  };
  img.src = '/background.jpg';

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
