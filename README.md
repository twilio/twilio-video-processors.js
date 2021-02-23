# Twilio Video Processors
Twilio Video Processors is a collection of video processing tools which can be used with [Twilio Video JavaScript SDK](https://github.com/twilio/twilio-video.js) to apply transformations and filters to a video track.

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
npm install @twilio/video-processors.js --save
```

Or install from a local directory.
```
npm install /local-path-to-repo/video-processors.js
```

Using this method, you can import `video-processors.js` like so:
```ts
import * as VideoProcessors from '@twilio/video-processors.js';
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
TODO: Add examples and API Docs link

## Related
* [Twilio Video JS SDK](https://github.com/twilio/twilio-video.js)
* [Twilio Video JS Quickstart](https://github.com/twilio/video-quickstart-js)
* [Twilio Video JS React App](https://github.com/twilio/twilio-video-app-react)

## License
See [LICENSE.md](LICENSE.md)
