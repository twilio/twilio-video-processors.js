# Twilio Video Processors

Twilio Video Processors is a collection of video processing tools which can be used with [Twilio Video JavaScript SDK](https://github.com/twilio/twilio-video.js) to apply transformations and filters to a VideoTrack.

* [API Docs](https://twilio.github.io/video-processors.js/)
* [Virtual Background Demo](https://twilio.github.io/video-processors.js/examples/virtualbackground/)

## Features

- Virtual Background
- Background Blur

## Prerequisites

* [Twilio Video JavaScript SDK](https://github.com/twilio/twilio-video.js) (v2.13+)
* [Node.js](https://nodejs.org) (v14+)
* NPM (v6+, comes installed with newer Node versions)

## Installation

### NPM

Install from a local directory.

```
# package-folder contains the package.json
npm install /local-path-to-package/package-folder

```

Using this method, you can import `video-processors` like so:

```ts
import * as VideoProcessors from '@twilio/video-processors';
```

### Script tag

You can also copy `video-processors.js` from the `dist` folder and include it directly in your web app using a `<script>` tag.

 ```html
 <script src="https://my-server-path/video-processors.js"></script>
 ```

 Using this method, `video-processors.js` will set a browser global:
 
 ```ts
 const VideoProcessors = Twilio.VideoProcessors;
 ```

### Assets

In order to achieve the best performance, the Video Processors uses WebAssembly to run TensorFlow Lite for inference. You need to serve the tflite model and binaries so you can reference them from your application. These files can be downloaded from the `dist/build` folder. Check the [examples](examples) folder for reference.

Below is a list of files that you need to serve. The `xxx` indicates the version of the file.

* model-xxx.tflite - Use this in the [modelUrl](https://twilio.github.io/video-processors.js/interfaces/virtualbackgroundprocessoroptions.html#modelurl) parameter. See example below.
* tflite-xxx.js - Load this using `<script>` tag. See example below.
* tflite-simd-xxx.js - Load this using `<script>` tag. See example below.
* tflite-xxx.wasm - This should live in the same folder as `tflite-xxx.js`.
* tflite-simd-xxx.wasm - This should live in the same folder as `tflite-simd-xxx.js`.

Example for specifying the `modelUrl` parameter.

```ts
const virtualBackground = new VirtualBackgroundProcessor({
  backgroundImage: img,
  modelUrl: 'https://my-server-path/model-selfiesegmentation_mlkit-256x256-2021_01_19-v1215.f16.tflite'
});

await virtualBackground.loadModel();
```

Example for loading the tflite JS files.

```html
 <script src="/my-server-path/tflite-1.0.0.js"></script>
 <script src="/my-server-path/tflite-simd-1.0.0.js"></script>
```

## Usage

Please check out the following pages for example usage. These processors are only supported on the Chrome browser at this moment and will not work on other browsers. For best performance and accuracy, we recommend that, when calling [Video.createLocalVideoTrack](https://sdk.twilio.com/js/video/releases/2.13.1/docs/module-twilio-video.html#.createLocalVideoTrack__anchor), the video capture constraints be set to `24 fps` frame rate with `640x480` capture dimensions. Higher resolutions can still be used for increased accuracy, but may degrade performance, resulting in a lower output frame rate.

* [VirtualBackgroundProcessor](https://twilio.github.io/video-processors.js/classes/virtualbackgroundprocessor.html)
* [GaussianBlurBackgroundProcessor](https://twilio.github.io/video-processors.js/classes/gaussianblurbackgroundprocessor.html)

## Known Issues

* Video Processor execution will result in a significant increase in CPU usage.
* Precision on segmentation mask can be poor on certain conditions such as uneven lighting and increased body movements.
