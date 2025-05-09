3.1.0 (April 25, 2025)
===============================

### New Features
* Added backward compatibility for environments that do not have access to the `WebGL2` API. In such cases, the Pipeline will automatically revert to `Canvas2D`, ensuring functionality. However, `WebGL2` is still preferred and recommended due to its superior performance capabilities.

3.0.0 (January 16, 2025)
===============================

### Breaking Changes
* Now requires twilio-video SDK v2.29.0 or later
* Unified the `Canvas2D` and `WebGL2` pipelines into a single hybrid pipeline
  * Pipelines are now automatically managed
  * Removed `BackgroundProcessorOptions.debounce` and `BackgroundProcessorOptions.pipeline`
  * The `Pipeline` enum is no longer exported
* Changed frame buffer handling in video processors
  * While adding a VideoProcessor to a VideoTrack, use the following `AddProcessorOptions`:
    ```js
    videoTrack.addProcessor(processor, {
      inputFrameBufferType: 'videoframe',
      outputFrameBufferContextType: 'bitmaprenderer'
    });
    ```
* Bump minimum Node version to 18.

### Features
* Added web worker support
  * Now supported across all major browsers (Chrome, Firefox, Safari)
  * Cross-domain worker hosting is now supported.
    Example cross-domain configuration:
    ```js
    import { GaussianBlurBackgroundProcessor } from '@twilio/video-processors';

    /* Application is running at https://example.com/app */

    const processor = new GaussianBlurBackgroundProcessor({
      assetsPath: "https://example.net/path/to/assets"
    });
    ```
    (Requires proper `Access-Control-Allow-Origin` headers pointing to your application domain)

### Performance
This update improves video processing performance, especially on low-powered devices. Key advantages include:
  * Processing is handled by web workers in all major browsers, reducing main thread blocking.
  * Resource usage is optimized through a unified hybrid pipeline.

3.0.0-beta.1 (December 4, 2024)
===============================

* Web workers are now supported for Firefox and Safari.

3.0.0-preview.2 (September 16, 2024)
====================================

* The web workers can now be hosted on a different domain than that of the application, provided the `Access-Control-Allow-Origin` response header points to the domain of the application.
  ```ts
  import { GaussianBlurBackgroundProcessor } from '@twilio/video-processors';

  /* Application is running at https://appserver.com/app */

  const processor = new GaussianBlurBackgroundProcessor({
    assetsPath: "https://assetsserver.com/path/to/assets"
  });
  ```

3.0.0-preview.1 (August 13, 2024)
=================================

Version 3 of the Video Processor introduces significant enhancements, delivering improved performance on low-powered devices. This version is compatible with twilio-video SDK versions *2.29.0 and later*.

API Changes
-----------

* The VideoProcessors now run in web workers on Chromium-based browsers. Support for web workers on other supported browsers is upcoming. While adding a `VideoProcessor` to a `VideoTrack`, use the following `AddProcessorOptions`:
  ```ts
  videoTrack.addProcessor(processor, {
    inputFrameBufferType: 'videoframe',
    outputFrameBufferContextType: 'bitmaprenderer'
  });
  ```
* [GaussianBlurBackgroundProcessor](https://twilio.github.io/twilio-video-processors.js/classes/GaussianBlurBackgroundProcessor.html#processFrame) and [VirtualBackgroundProcessor](https://twilio.github.io/twilio-video-processors.js/classes/VirtualBackgroundProcessor.html#processFrame)'s `processFrame` method now accepts an `inputFrameBuffer` of type `VideoFrame`.
* Added the following APIs:
  * [deferInputFrameDownscale](https://twilio.github.io/twilio-video-processors.js/interfaces/VirtualBackgroundProcessorOptions.html#deferInputFrameDownscale)
  * [useWebWorker](https://twilio.github.io/twilio-video-processors.js/interfaces/VirtualBackgroundProcessorOptions.html#useWebWorker)
* The `Canvas2D` and `WebGL2` pipelines are replaced by a single hybrid pipeline. Therefore, the following APIs are no longer available:
  * `BackgroundProcessorOptions.debounce`
  * `BackgroundProcessorOptions.pipeline`
  * `Pipeline` enum exported by `@twilio/video-processors`

2.2.0 (July 16, 2024)
=====================

Performance Improvements
------------------------

* The WebGL2 pipeline now has an overall higher output frame rate, even for 720p (HD) video.

Changes
-------

* `BackgroundProcessorOptions.debounce` is now set to `false` by default.
* `BackgroundProcessorOptions.maskBlurRadius` is now set to `8` as the default for the `WebGL2` pipeline, and `4` for the `Canvas2D` pipeline.

Bug Fixes
---------

* Fixed trailing effect of the person mask in both Canvas2D and WebGL2 pipelines.
* Fixed a bug where changing the `maskBlurRadius` value on the `VideoProcessor` was not working.
* TFLite module is loaded and initialized only once, no matter how many VideoProcessor instances are created.

2.1.0 (December 12, 2023)
=========================

* Previously, the VideoProcessors SDK failed to compile with TypeScript 5.x. This release contains changes to support TypeScript 5.x.
* Fixed a bug where WebGL2-based VideoProcessors sometimes generated very low output fps, especially on low-powered Intel graphics cards. 

2.0.0 (March 21, 2023)
======================

* The VideoProcessors now work on browsers that do not support `OffscreenCanvas`. With this release, when used with [twilio-video v2.27.0](https://www.npmjs.com/package/twilio-video/v/2.27.0), the Virtual Background feature will work on browsers that supports [WebGL2](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext). See [VideoTrack.addProcessor](https://sdk.twilio.com/js/video/releases/2.27.0/docs/VideoTrack.html#addProcessor__anchor) for details.
* On Chrome, our tests with 640x480 VideoTracks show up to 30% reduction in CPU usage if WebGL2 is used as opposed to Canvas2D. Higher resolutions degrade the performance as compared to Canvas2D. While we work to support higher resolutions in future releases, we strongly recommend that you set the maximum resolution to 640x480 for WebGL2, or use Canvas2D instead.

#### API Changes

* [isSupported](https://twilio.github.io/twilio-video-processors.js/modules.html#issupported) now returns `true` for browsers that supports canvas [2D](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) or [webgl2](https://developer.mozilla.org/en-US/docs/Web/API/WebGL2RenderingContext) rendering context.
* [GaussianBlurBackgroundProcessor](https://twilio.github.io/twilio-video-processors.js/classes/gaussianblurbackgroundprocessor.html#processframe) and [VirtualBackgroundProcessor](https://twilio.github.io/twilio-video-processors.js/classes/virtualbackgroundprocessor.html#processframe)'s `processFrame` method now accepts different types of `inputFrameBuffer` - `OffscreenCanvas`, `HTMLCanvasElement` or `HTMLVideoElement`.
* Added the following new options
  - [GaussianBlurBackgroundProcessorOptions.debounce](https://twilio.github.io/twilio-video-processors.js/interfaces/gaussianblurbackgroundprocessoroptions.html#debounce)
  - [GaussianBlurBackgroundProcessorOptions.pipeline](https://twilio.github.io/twilio-video-processors.js/interfaces/gaussianblurbackgroundprocessoroptions.html#pipeline)
  - [VirtualBackgroundProcessorOptions.debounce](https://twilio.github.io/twilio-video-processors.js/interfaces/virtualbackgroundprocessoroptions.html#debounce)
  - [VirtualBackgroundProcessorOptions.pipeline](https://twilio.github.io/twilio-video-processors.js/interfaces/virtualbackgroundprocessoroptions.html#pipeline)

*NOTES:*

* Although iOS and Android browsers (Safari and Chrome) are supported, the performance of the VideoProcessors is not optimized for mobile browsers at this time. Using the VideoProcessors on a mobile browser may overpower the CPU resulting in poor quality video experiences.
* Since desktop Safari and iOS browsers do not support [WebAssembly SIMD](https://v8.dev/features/simd), it is recommended to use camera input dimensions of 640x480 or lower to maintain an acceptable frame rate for these browsers.

#### Example

See the following pages for best practice.

* [VirtualBackgroundProcessor](https://twilio.github.io/twilio-video-processors.js/classes/virtualbackgroundprocessor.html)
* [GaussianBlurBackgroundProcessor](https://twilio.github.io/twilio-video-processors.js/classes/gaussianblurbackgroundprocessor.html)

Other Changes
-------------

* Removing unused BodyPix related logic.
* Removing unnecessary loading of JS files after loading the model.

1.0.2 (November 5, 2021)
=====================

Changes
-------

* Moving `@types/node` to devDependencies.
* Fixed an issue where twilio-video-processors is throwing an exception in a server-side rendering application.

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
