import Promise from 'bluebird'
import GIFDecoder from 'gif-stream/decoder'
import ConcatFrames from 'concat-frames'

export default class GIF {
  static async decode (image) {
    let frames = await new Promise((resolve, reject) => {
      console.log(`[Decoder.GIF Start] ${image.url}`)
      image.stream.pipe(new GIFDecoder())
        .pipe(ConcatFrames(resolve))
        .on('error', (e) => {
          console.log(`[Decoder.GIF Error] ${image.url}`)
          reject(e)
        })
    })

    image.raw = frames[0]
    console.log(`[Decoder.GIF End] ${image.url}`)

    return image
  }
}
