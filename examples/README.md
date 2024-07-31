# Virtual Background Demo

## Setup

Go to `${PROJECT_ROOT}/examples` and run `npm install`. It will install the dependencies and run the application server.

## Running the Demo

Open `http://localhost:3000` in a Chrome tab. The app captures your camera upon loading and plays it in a `<video>` element. You can choose to enable, disable or update the background settings using the controls on the page. Additionally, you can specify the following url parameters:

- `blurFilterRadius` - Radius of the background blur filter (default: 15)
- `capFramerate` - Choose video capture frame rate (default: 30)
- `capResolution=wxh` - Choose video capture resolution (default: 1280x720)
- `deferInputFrameDownscale=true|false` - **(Chrome only)** Whether to calculate the person mask without waiting for the input frame to be downscaled (default: false)
- `maskBlurRadius` - Radius of the mask blur filter (default: 8)
- `stats=advanced|hide|show` - Show performance benchmarks (default: show)
- `useWebWorker=true|false` - **(Chrome only)** Whether to use a web worker for background replacement (default: false)
