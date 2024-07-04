/**
 * @private
 */
export class Pipeline implements Pipeline.Stage {
  protected _stages: Pipeline.Stage[] = []

  addStage(stage: Pipeline.Stage): void {
    this._stages.push(stage)
  }

  render(...args: any[]): void {
    this._stages.forEach((stage) => {
      stage.render()
    })
  }
}

export namespace Pipeline {
  export interface Stage {
    render(...args: any[]): void
  }
}
