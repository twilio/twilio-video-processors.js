# Twilio Video Processors

[![NPM](https://img.shields.io/npm/v/@twilio/video-processors.svg)](https://www.npmjs.com/package/@twilio/video-processors)

Twilio Video Processors is a collection of video processing tools which can be used with [Twilio Video JavaScript SDK](https://github.com/twilio/twilio-video.js) to apply transformations and filters to a video track.

* [API Docs](https://twilio.github.io/video-processors.js/modules.html)
* [Example](example/)
* [Demo](https://twilio.github.io/video-processors.js/example/)

## Features
- Virtual background
- Background blur

## Installation

### Building the project locally

```bash
# Clone repository
git clone git@github.com:twilio/video-processors.js.git
cd video-processors.js

# Install dependencies
npm install

# Build the artifacts
npm run build
```

### NPM
You can install directly from npm.
```
npm install @twilio/video-processors --save
```

Or install from a local directory.
```
npm install /local-path-to-repo/video-processors.js
```

Using this method, you can import `video-processors` like so:
```ts
import * as VideoProcessors from '@twilio/video-processors';
```

### Script tag
You can also include `video-processors.js` directly in your web app using a `<script>` tag.
 ```html
 <script src="https://my-server-path/video-processors.js"></script>
 ```

 Using this method, `video-processors.js` will set a browser global:
 ```ts
 const VideoProcessors = Twilio.VideoProcessors;
 ```

## Usage

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

## Related
* [Twilio Video JS SDK](https://github.com/twilio/twilio-video.js)
* [Twilio Video JS Quickstart](https://github.com/twilio/video-quickstart-js)
* [Twilio Video JS React App](https://github.com/twilio/twilio-video-app-react)

## License
See [LICENSE.md](LICENSE.md)
