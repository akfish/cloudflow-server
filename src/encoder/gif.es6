import GIFEncoder from 'gif-stream/encoder'
import neuquant from 'neuquant'
import path from 'path'

export default class GIF {
  static encode (key, storage, image) {
    let frame = image[key]
    let { dir, name } = image.file
    let { palette, width, height, pixels } = frame

    let indexed = pixels

    if (frame.colorSpace !== 'index' || pixels.length !== width * height) {
      let q = neuquant.quantize(pixels)
      palette = q.palette
      indexed = q.indexed
    }

    let enc = new GIFEncoder(frame.width, frame.height, { palette })
    let output = path.join(dir, `${name}-${key}.gif`)
    enc.pipe(storage.createWriteStream(output))
    enc.end(indexed)
    console.log(`[Encoder.GIF] ${output}`)
  }
}
