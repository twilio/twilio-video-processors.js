export const pause = async (delayMs: number = 5000): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });

export const loadImage = async (url: string): Promise<HTMLImageElement> =>
  new Promise(resolve => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.src = url;
  });

export const getImageFromCanvas = async (canvas: HTMLCanvasElement): Promise<HTMLImageElement> =>
  new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.src = canvas.toDataURL();
  });

export const compareImages = async (inputImageA: HTMLImageElement, inputImageB: HTMLImageElement, options?: any): Promise<void> =>
  new Promise((resolve, reject) => {
    options = options || {};
    const Rembrandt = (window as any).Rembrandt;
    const imageA = new Rembrandt.Image(inputImageA.width, inputImageA.height, inputImageA);
    const imageB = new Rembrandt.Image(inputImageB.width, inputImageB.height, inputImageB);

    const rembrandt = new Rembrandt({
      imageA,
      imageB,
      ...options,
    });

    return rembrandt.compare().then((result: any) => {
      result.passed ? resolve() : reject();
    });
  });
