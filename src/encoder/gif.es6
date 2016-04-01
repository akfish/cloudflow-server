import Promise from 'bluebird'
import GIFEncoder from 'gif-stream/encoder'
import neuquant from 'neuquant'
import path from 'path'
import Logger from '../logger'
const log = Logger.get()

export default class GIF {
  static encode (key, storage, image) {
    let frame = image[key]
    let { dir, name } = image.file
    let output = path.join(dir, `${name}-${key}.gif`)

    return new Promise((resolve, reject) => {
      log.encode('begin.gif', `${image}:${key}`)
      if (!frame) {
        log.encode('skip.gif', `${image}:${key}`)
        return resolve()
      }
      let { palette, width, height, pixels } = frame

      let indexed = pixels

      if (frame.colorSpace !== 'indexed' || pixels.length !== width * height) {
        let q = neuquant.quantize(pixels)
        palette = q.palette
        indexed = q.indexed
      }
      let enc = new GIFEncoder(frame.width, frame.height, { palette })
      let outputStream = storage.createWriteStream(output)
      enc.pipe(outputStream)
      enc.end(indexed)
      outputStream.on('error', reject)
      outputStream.on('finish', () => {
        log.encode('end.gif', `${image}:${key}`)
        resolve()
      })
    })
  }
}
