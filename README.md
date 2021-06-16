# Twilio Video Processors

Twilio Video Processors is a collection of video processing tools which can be used with [Twilio Video JavaScript SDK](https://github.com/twilio/twilio-video.js) to apply transformations and filters to a VideoTrack.

&nbsp;&nbsp; [See it live here!](https://twilio.github.io/twilio-video-processors.js/examples/virtualbackground/)

## Features

- Virtual Background
- Background Blur

## Prerequisites

* [Twilio Video JavaScript SDK](https://github.com/twilio/twilio-video.js) (v2.15+)
* [Node.js](https://nodejs.org) (v14+)
* NPM (v6+, comes installed with newer Node versions)

## Installation

### NPM

You can install directly from npm.

```
npm install @twilio/video-processors-sdk --save
```

Using this method, you can import `twilio-video-processors` like so:

```ts
import * as VideoProcessors from '@twilio/video-processors-sdk';
```

### Script tag

You can also copy `twilio-video-processors.js` from the `dist/build` folder and include it directly in your web app using a `<script>` tag.

 ```html
 <script src="https://my-server-path/twilio-video-processors.js"></script>
 ```

 Using this method, `twilio-video-processors.js` will set a browser global:
 
 ```ts
 const VideoProcessors = Twilio.VideoProcessors;
 ```

### Assets

In order to achieve the best performance, the VideoProcessors use WebAssembly to run TensorFlow Lite for person segmentation. You need to serve the tflite model and binaries so the SDK can load them properly. These files can be downloaded from the `dist/build` folder. Check the [API docs](https://twilio.github.io/twilio-video-processors.js/interfaces/virtualbackgroundprocessoroptions.html#assetspath) for details and the [examples](https://github.com/twilio/twilio-video-processors.js/tree/master/examples) folder for reference.

## Usage

These processors are only supported on chromium-based desktop browsers at this moment and will not work on other browsers. For best performance and accuracy, we recommend that, when calling [Video.createLocalVideoTrack](https://sdk.twilio.com/js/video/releases/2.13.1/docs/module-twilio-video.html#.createLocalVideoTrack__anchor), the video capture constraints be set to `24 fps` frame rate with `640x480` capture dimensions. Higher resolutions can still be used for increased accuracy, but may degrade performance, resulting in a lower output frame rate on low powered devices.

Additionally, these processors run TensorFlow Lite using [MediaPipe Selfie Segmentation Landscape Model](https://drive.google.com/file/d/1dCfozqknMa068vVsO2j_1FgZkW_e3VWv/preview) and requires Chrome's [WebAssembly SIMD](https://v8.dev/features/simd) support in order to achieve the best performance. WebAssembly SIMD can be turned on by visiting `chrome://flags` on versions 84 through 90. This will be enabled by default on Chrome 91+. You can also enable this on versions 84-90 for your users without turning on the flag by [registering](https://developer.chrome.com/origintrials/#/trials/active) for a [Chrome Origin Trial](http://googlechrome.github.io/OriginTrials/developer-guide.html#:~:text=You%20can%20opt%20any%20page,a%20token%20for%20your%20origin.&text=NOTE%3A,tokens%20for%20a%20given%20page.) for your website.

Please check out the following pages for example usage. For more information, please refer to the [API Docs](https://twilio.github.io/twilio-video-processors.js/).

* [VirtualBackgroundProcessor](https://twilio.github.io/twilio-video-processors.js/classes/virtualbackgroundprocessor.html)
* [GaussianBlurBackgroundProcessor](https://twilio.github.io/twilio-video-processors.js/classes/gaussianblurbackgroundprocessor.html)
