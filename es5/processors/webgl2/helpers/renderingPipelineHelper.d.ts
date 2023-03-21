import { PostProcessingConfig } from './postProcessingHelper';
export declare type RenderingPipeline = {
    render(): Promise<void>;
    updatePostProcessingConfig(newPostProcessingConfig: PostProcessingConfig): void;
    cleanUp(): void;
};
