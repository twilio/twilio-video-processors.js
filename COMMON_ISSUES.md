# Common Issues

* On Chrome, resolutions higher than 640x480 degrade the performance as compared to Canvas2D. While we work to support higher resolutions in future releases, we strongly recommend that you set the maximum resolution to 640x480 for WebGL2, or use Canvas2D instead.
* Video Processor execution will result in a significant increase in CPU usage.
* Precision on segmentation mask can be poor on certain conditions such as uneven lighting and increased body movements.
* Currently, desktop Safari and iOS browsers do not support [WebAssembly SIMD](https://v8.dev/features/simd). It is recommended to use camera input dimensions of 640x480 or lower to maintain an acceptable frame rate.
* Currently, the SDK [throws](https://github.com/twilio/twilio-video.js/issues/1629) a TypeScript error while trying to compile when used in projects with TypeScript versions in the range of 4.4.2 - 4.8.4. You can work around this by following this [suggestion](https://github.com/twilio/twilio-video.js/issues/1629#issuecomment-1701877481).
