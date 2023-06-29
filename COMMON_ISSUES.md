# Common Issues

* On Chrome, resolutions higher than 640x480 degrade the performance as compared to Canvas2D. While we work to support higher resolutions in future releases, we strongly recommend that you set the maximum resolution to 640x480 for WebGL2.
* Video Processor execution will result in a significant increase in CPU usage.
* Precision on segmentation mask can be poor on certain conditions such as uneven lighting and increased body movements.
* Currently, desktop Safari and iOS browsers do not support [WebAssembly SIMD](https://v8.dev/features/simd). It is recommended to use camera input dimensions of 640x480 or lower to maintain an acceptable frame rate.
