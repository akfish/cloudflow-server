import Promise from 'bluebird'
import GIFDecoder from 'gif-stream/decoder'
import ConcatFrames from 'concat-frames'

export default class GIF {
  static async decode (image) {
    let frames = await new Promise((resolve, reject) => {
      image.stream.pipe(new GIFDecoder())
        .pipe(ConcatFrames(resolve))
        .on('error', reject)
    })

    image.raw = frames[0]

    return image
  }
}
