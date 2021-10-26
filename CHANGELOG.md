1.0.2 (In Progress)
=====================

Changes
-------

* Moving `@types/node` to devDependencies.

1.0.1 (July 12, 2021)
=====================

Bug Fixes
---------

* Fixed an issue where the following internal classes and interfaces are being exported.
  - BackgroundProcessor
  - BackgroundProcessorOptions
  - GrayscaleProcessor
  - Processor
  - Dimensions

1.0.0 (June 24, 2021)
==========================

1.0.0-beta.3 has been promoted to 1.0.0 GA. Twilio Video Processors will use [Semantic Versioning 2.0.0](https://semver.org/#semantic-versioning-200) for all future changes. Additionally, this release also includes the following new features and improvements.

* Added `isSupported` API which can be used to check whether the browser is supported or not. This API returns `true` for chromium-based desktop browsers.
  ```ts
  import { isSupported } from '@twilio/video-processors';

  if (isSupported) {
    // Initialize the background processors
  }
  ```

* [GaussianBlurBackgroundProcessor](https://twilio.github.io/twilio-video-processors.js/classes/gaussianblurbackgroundprocessor.html#processframe) and [VirtualBackgroundProcessor](https://twilio.github.io/twilio-video-processors.js/classes/virtualbackgroundprocessor.html#processframe)'s `processFrame` method signature has been updated in order to improve performance. With this update, the output frame buffer should now be provided to the `processFrame` method which will be used to draw the processed frame.

  Old signature:

  ```ts
  processFrame(inputFrame: OffscreenCanvas)
    : Promise<OffscreenCanvas | null>
    | OffscreenCanvas | null;
  ```

  New signature:

  ```ts
  processFrame(inputFrameBuffer: OffscreenCanvas, outputFrameBuffer: HTMLCanvasElement)
    : Promise<void> | void;
  ```

* The segmentation model has been changed from [MLKit Selfie Segmentation](https://developers.google.com/ml-kit/images/vision/selfie-segmentation/selfie-model-card.pdf) to [MediaPipe Selfie Segmentation Landscape](https://drive.google.com/file/d/1dCfozqknMa068vVsO2j_1FgZkW_e3VWv/preview) to improve performance.

* Added debounce logic on the image resizing step to improve performance.

1.0.0-beta.3 (May 25, 2021)
===================

Improvements
------------

* The VideoProcessors now use WebAssembly to run TensorFlow Lite for faster and more accurate person segmentation. You need to deploy the [tflite model and binaries](README.md#assets) so the library can load them properly. Additionally, this improvement requires Chrome's [WebAssembly SIMD](https://v8.dev/features/simd) support in order to achieve the best performance. WebAssembly SIMD can be turned on by visiting `chrome://flags` on versions 84 through 90. This will be enabled by default on Chrome 91+. You can also enable this on versions 84-90 for your users without turning on the flag by [registering](https://developer.chrome.com/origintrials/#/trials/active) for a [Chrome Origin Trial](http://googlechrome.github.io/OriginTrials/developer-guide.html#:~:text=You%20can%20opt%20any%20page,a%20token%20for%20your%20origin.&text=NOTE%3A,tokens%20for%20a%20given%20page.) for your website.

* The segmentation model has been changed from [BodyPix](https://github.com/tensorflow/tfjs-models/tree/master/body-pix) to [MLKit Selfie Segmentation](https://developers.google.com/ml-kit/images/vision/selfie-segmentation/selfie-model-card.pdf) to improve segmentation accuracy.

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
