# Twilio Video Processors

Twilio Video Processors is a collection of video processing tools which can be used with [Twilio Video JavaScript SDK](https://github.com/twilio/twilio-video.js) to apply transformations and filters to a VideoTrack.

* [API Docs](dist/docs/modules.html)

## Features
- Virtual background
- Background blur

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

## Usage

Please check out the following pages for example usage. These processors are only supported on the Chrome browser at this moment and will not work on other browsers. For best performance and accuracy, a `24fps` with `640x480` resolution `MediaStream` is recommended when calling [Video.createLocalVideoTrack](https://media.twiliocdn.com/sdk/js/video/releases/2.13.1/docs/module-twilio-video.html#.createLocalVideoTrack__anchor). Higher resolutions can still be used but the frame rate will be degraded.

* [VirtualBackgroundProcessor](dist/docs/classes/virtualbackgroundprocessor.html)
* [GaussianBlurBackgroundProcessor](dist/docs/classes/gaussianblurbackgroundprocessor.html)
