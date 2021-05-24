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

In order to achieve the best performance, the VideoProcessors use WebAssembly to run TensorFlow Lite for person segmentation. You need to serve the tflite model and binaries so the SDK can load them properly. These files can be downloaded from the `dist/build` folder. Check the [API docs](https://twilio.github.io/video-processors.js/interfaces/virtualbackgroundprocessoroptions.html#assetspath) for details and the [examples](examples) folder for reference.

## Usage

Please check out the following pages for example usage. These processors are only supported on the Chrome browser at this moment and will not work on other browsers. For best performance and accuracy, we recommend that, when calling [Video.createLocalVideoTrack](https://sdk.twilio.com/js/video/releases/2.13.1/docs/module-twilio-video.html#.createLocalVideoTrack__anchor), the video capture constraints be set to `24 fps` frame rate with `640x480` capture dimensions. Higher resolutions can still be used for increased accuracy, but may degrade performance, resulting in a lower output frame rate.

* [VirtualBackgroundProcessor](https://twilio.github.io/video-processors.js/classes/virtualbackgroundprocessor.html)
* [GaussianBlurBackgroundProcessor](https://twilio.github.io/video-processors.js/classes/gaussianblurbackgroundprocessor.html)

## Known Issues

* Video Processor execution will result in a significant increase in CPU usage.
* Precision on segmentation mask can be poor on certain conditions such as uneven lighting and increased body movements.
