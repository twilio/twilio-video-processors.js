/**
 * @private
 */
export declare class Pipeline implements Pipeline.Stage {
    protected readonly _stages: Pipeline.Stage[];
    addStage(stage: Pipeline.Stage): void;
    render(...args: any[]): void;
}
export declare namespace Pipeline {
    interface Stage {
        render(...args: any[]): void;
    }
}
