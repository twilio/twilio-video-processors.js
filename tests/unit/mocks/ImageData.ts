export class ImageData {
  data: Uint8ClampedArray;
  height: number;
  width: number;

  constructor(width: number, height: number) {
    this.data = new Uint8ClampedArray(width * height);
    this.width = width;
    this.height = height;
  }
}
