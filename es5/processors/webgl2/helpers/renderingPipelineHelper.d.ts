import { PostProcessingConfig } from './postProcessingHelper';
export type RenderingPipeline = {
    render(): Promise<void>;
    updatePostProcessingConfig(newPostProcessingConfig: PostProcessingConfig): void;
    cleanUp(): void;
};
