import { WebGL2Pipeline } from '../../../pipelines';
/**
 * @private
 */
export declare class SinglePassGaussianBlurFilterStage extends WebGL2Pipeline.ProcessingStage {
    constructor(glOut: WebGL2RenderingContext, direction: 'horizontal' | 'vertical', outputType: 'canvas' | 'texture', inputTextureUnit: number, outputTextureUnit?: number);
    updateRadius(radius: number): void;
}
