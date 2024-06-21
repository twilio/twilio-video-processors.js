export type InputResolution = '640x360' | '256x256' | '256x144' | '160x96' | string

export const inputResolutions: {
  [resolution in InputResolution]: [number, number]
} = {
  '640x360': [640, 360],
  '256x256': [256, 256],
  '256x144': [256, 144],
  '160x96': [160, 96],
}

export type SegmentationConfig = {
  deferWebGL2InputResize: boolean
  inputResolution: InputResolution
}
