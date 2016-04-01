import Promise from 'bluebird'
import GIFDecoder from 'gif-stream/decoder'
import ConcatFrames from 'concat-frames'
import Logger from '../logger'
const log = Logger.get()

export default class GIF {
  static async decode (image) {
    let frames = await new Promise((resolve, reject) => {
      function onError (e) {
        log.error('decode', `${image}`)
        reject(e)
      }
      log.decode('begin', `${image}`)
      let decoder = new GIFDecoder()
      decoder.on('error', onError)
      image.stream.pipe(decoder)
        .pipe(ConcatFrames(resolve))
        .on('error', onError)
    })

    image.raw = frames[0]
    log.decode('end', `${image}`)

    return image
  }
}
