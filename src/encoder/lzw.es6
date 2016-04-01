import LZWEncoder from 'lzw-stream/encoder'
import { PassThrough } from 'stream'
import Promise from 'bluebird'
import path from 'path'
import Logger from '../logger'
const log = Logger.get()

export default class LZW {
  static encode (key, storage, image) {
    let frame = image[key]
    let { dir, name } = image.file
    let output = path.join(dir, `${name}-${key}.lzw`)


    return new Promise((resolve, reject) => {
      log.encode('begin.lzw', `${image}:${key}`)
      if (!frame) {
        log.encode('skip.lzw', `${image}:${key}`)
        return resolve()
      }

      let outputStream = storage.createWriteStream(output)
      outputStream.on('error', reject)
      outputStream.on('finish', () => {
        log.encode('end.lzw', `${image}:${key}`)
        resolve()
      })

      let pixelStream = new PassThrough()
      pixelStream.end(frame.pixels)
      pixelStream
        .pipe(new LZWEncoder())
        .pipe(outputStream)
    })
  }
}
