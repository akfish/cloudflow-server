import Promise from 'bluebird'
import GIFDecoder from 'gif-stream/decoder'
import ConcatFrames from 'concat-frames'

export default class GIF {
  static async decode (image) {
    let frames = await new Promise((resolve, reject) => {
      function onError (e) {
        console.log(`[Decoder.GIF Error] ${image.url}`)
        reject(e)
      }
      console.log(`[Decoder.GIF Start] ${image.url}`)
      let decoder = new GIFDecoder()
      decoder.on('error', onError)
      image.stream.pipe(decoder)
        .pipe(ConcatFrames(resolve))
        .on('error', onError)
    })

    image.raw = frames[0]
    console.log(`[Decoder.GIF End] ${image.url}`)

    return image
  }
}
