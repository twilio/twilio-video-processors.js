# Twilio Video Processors

Twilio Video Processors is a collection of video processing tools which can be used with [Twilio Video JavaScript SDK](https://github.com/twilio/twilio-video.js) to apply transformations and filters to a VideoTrack.

&nbsp;&nbsp; [See it live here!](https://twilio.github.io/twilio-video-processors.js/examples/virtualbackground/)

## Features

The following Video Processors are provided to apply transformations and filters to a person's background. You can also use them as a reference for creating your own Video Processors that can be used with [Twilio Video JavaScript SDK](https://github.com/twilio/twilio-video.js).

- [Virtual Background](https://twilio.github.io/twilio-video-processors.js/classes/VirtualBackgroundProcessor.html)
- [Background Blur](https://twilio.github.io/twilio-video-processors.js/classes/GaussianBlurBackgroundProcessor.html)

## Prerequisites

* [Twilio Video JavaScript SDK](https://github.com/twilio/twilio-video.js) (v2.29+)
* [Node.js](https://nodejs.org) (v18+)
* NPM (v10+, comes installed with newer Node versions)

### Note

The **Node.js** and **NPM** requirements do not apply if the goal is to use this library as a dependency of your project. They only apply if you want to check the source code out and build the artifacts and/or run tests.

## Installation

### NPM

You can install directly from npm.

```sh
npm install @twilio/video-processors --save
```

Using this method, you can import `twilio-video-processors` like so:

```ts
import * as VideoProcessors from '@twilio/video-processors';
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

In order to achieve the best performance, the VideoProcessors use WebAssembly to run TensorFlow Lite for person segmentation. You need to serve the tflite model, binaries and web workers so they can be loaded properly. These files can be downloaded from the `dist/build` folder. Check the [API docs](https://twilio.github.io/twilio-video-processors.js/interfaces/VirtualBackgroundProcessorOptions.html#assetsPath) for details and the [examples](https://github.com/twilio/twilio-video-processors.js/tree/master/examples) folder for reference.

You can use the `assetsPath` option to specify the path to the assets. Depending on your use case, you can either serve the assets as follows:

#### Recommended: Same-Origin Hosting

For optimal security, performance, and the simplest configuration, **we strongly recommend serving these assets from the same origin (domain, protocol, and port) as your main application.** This avoids complexities with Cross-Origin Resource Sharing (CORS) and Content Security Policy (CSP).

You would typically copy the contents of the `dist/build` folder to a publicly accessible directory within your application's web server (e.g., `/static/twilio-video-processors-assets/`) and configure the `assetsPath` option in the `VideoProcessors` constructor to point to this location. For example:

```javascript
// Assuming assets are served from https://example.com/static/twilio-video-processors-assets/
const virtualBackground = new VideoProcessors.VirtualBackgroundProcessor({
  assetsPath: '/static/twilio-video-processors-assets/'
});
```

#### Alternative: Cross-Origin Hosting

If serving assets from the same origin is not feasible, you can host them on a different origin (e.g., a trusted CDN). However, this requires careful setup of CORS and CSP. If you choose this path, refer to the [Cross-Origin Configuration](#cross-origin-configuration) section below for detailed instructions.

### Cross-Origin Configuration

As highlighted in the [Assets](#assets) section, if you must host your Video Processors assets on a different origin than your main application, your browser's security policies (CORS and CSP) will require specific configurations.

The following sections provide details on how to set these headers for cross-origin requests. For the sake of simplicity, we'll use `https://example.com` as your app's origin and `https://assets.example.com` as the origin of the assets such as the tflite model, and web workers.

```javascript
// Assuming you need to serve assets from https://assets.example.com
const virtualBackground = new VideoProcessors.VirtualBackgroundProcessor({
  assetsPath: 'https://assets.example.com/static/twilio-video-processors-assets/'
});
```

#### CORS

Your asset server must send the `Access-Control-Allow-Origin` HTTP response header, set to your app’s exact origin. This header informs the browser that your application's origin is permitted to fetch resources from the asset server.

``` plaintext
Access-Control-Allow-Origin: https://example.com
```

#### Content Security Policy (CSP)

If your application enforces a Content Security Policy (CSP), you'll need to update it to allow the loading and execution of Web Workers and related assets.

```plaintext
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' data: https://assets.example.com; worker-src blob:; connect-src 'self' https://assets.example.com;
```

> Note: This is a general baseline you can customize to fit your needs. You do not need to send this CSP exactly as is—your application’s CSP should be configured according to your specific security requirements, and you should always thoroughly test your CSP after making changes.

In the example above, we are allowing the loading of the required Web Workers properly, but if you consider changing the CSP is not an option for you and still you need to host the assets on a different origin, you can use the `useWebWorkers` option to say the library to don't use Web Workers. That will force the library to use the main thread to process the video frames, but it will turn off the recilence and performance benefits of using Web Workers, and it could impact the UX of your application.

```javascript
const virtualBackground = new VideoProcessors.VirtualBackgroundProcessor({
  useWebWorkers: false
});
```

## Usage

These processors run TensorFlow Lite using [MediaPipe Selfie Segmentation Landscape Model](https://drive.google.com/file/d/1dCfozqknMa068vVsO2j_1FgZkW_e3VWv/preview) and requires [WebAssembly SIMD](https://v8.dev/features/simd) support in order to achieve the best performance. We recommend that, when calling [Video.createLocalVideoTrack](https://sdk.twilio.com/js/video/releases/2.28.0/docs/module-twilio-video.html#.createLocalVideoTrack__anchor), the video capture constraints be set to `24 fps` frame rate with `640x480` capture dimensions. Higher resolutions can still be used for increased accuracy, but may degrade performance, resulting in a lower output frame rate on low powered devices.

## Best Practice

Please check out the following pages for best practice:

* [VirtualBackgroundProcessor](https://twilio.github.io/twilio-video-processors.js/classes/VirtualBackgroundProcessor.html)
* [GaussianBlurBackgroundProcessor](https://twilio.github.io/twilio-video-processors.js/classes/GaussianBlurBackgroundProcessor.html)
