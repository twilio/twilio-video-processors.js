export type SourceConfig = {
  type: 'image' | 'video' | 'camera'
  url?: string
}

export type SourcePlayback = {
  htmlElement: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement
  width: number
  height: number
}
