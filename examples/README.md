# Virtual Background Demo

## Setup

Checkout the latest release tag (see the latest releases [here](https://github.com/twilio/twilio-video-processors.js/releases)). For example, to checkout release 1.0.0:

```
git checkout 1.0.0
```

Then, run `npm install` from the `examples` folder. It will install the dependencies and run the application server.

## App (Chrome Only)

Open http://localhost:3000 in a Chrome tab. The app captures your camera upon loading and plays it in a `<video>` element. You can choose to enable, disable or update the background settings using the controls on the page. Additionally, you can specify the following url parameters:

- `capFramerate` - Choose video capture frame rate (default: 24)
- `capResolution=wxh` - Choose video capture resolution (default: 640x480)
- `pipeline=Canvas2D|WebGL2` - Choose the canvas or webgl pipeline (default: WebGL2)
- `stats=hide|show` - Show performance benchmarks (default: show)
