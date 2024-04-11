/**
 * This pipeline is based on Volcomix's react project.
 * https://github.com/Volcomix/virtual-background
 * It was modified and converted into a module to work with
 * Twilio's Video Processor
 */
import { buildWebGL2Pipeline } from './pipelines/webgl2Pipeline'
import { buildWebGL2PipelineCanvas2D } from './pipelines/webgl2PipelineCanvas2D'

export {
  buildWebGL2Pipeline,
  buildWebGL2PipelineCanvas2D,
};
