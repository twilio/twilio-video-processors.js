export class Canvas {
  width: number;
  height: number;
  drawing: any;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  getContext(): any {
    return {
      drawImage: (inputFrame: OffscreenCanvas | HTMLCanvasElement, x: number, y: number, width: number, height: number) => {
        this.drawing = { inputFrame, x, y, width, height };
      }
    };
  }
}
