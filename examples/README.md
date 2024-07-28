# Virtual Background Demo

## Setup

Go to `${PROJECT_ROOT}/examples` and run `npm install`. It will install the dependencies and run the application server.

## Running the Demo

Open `http://localhost:3000` in a Chrome tab. The app captures your camera upon loading and plays it in a `<video>` element. You can choose to enable, disable or update the background settings using the controls on the page. Additionally, you can specify the following url parameters:

- `capFramerate` - Choose video capture frame rate (default: 30)
- `capResolution=wxh` - Choose video capture resolution (default: 1280x720)
- `debounce=true|false` - Whether to skip processing every other frame (default: false)
- `maskBlurRadius` - Radius of the mask blur filter (default: 8)
- `stats=advanced|hide|show` - Show performance benchmarks (default: show)
