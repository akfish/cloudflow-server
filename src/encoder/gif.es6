import Promise from 'bluebird'
import GIFEncoder from 'gif-stream/encoder'
import neuquant from 'neuquant'
import path from 'path'

export default class GIF {
  static encode (key, storage, image) {
    let frame = image[key]
    let { dir, name } = image.file
    let output = path.join(dir, `${name}-${key}.gif`)

    return new Promise((resolve, reject) => {
      if (!frame) {
        console.log(`[Encoder.GIF] SKIP ${image}:${key}`)
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
        console.log(`[Encoder.GIF] ${image}:${key}`)
        resolve()
      })
    })
  }
}
