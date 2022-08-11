# Common Issues

* Video Processor execution will result in a significant increase in CPU usage.
* Precision on segmentation mask can be poor on certain conditions such as uneven lighting and increased body movements.
* Currently, desktop Safari and iOS browsers do not support [WebAssembly SIMD](https://v8.dev/features/simd). It is recommended to use camera input dimensions of 640x480 or lower to maintain an acceptable frame rate.
