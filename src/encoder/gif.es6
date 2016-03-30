import GIFEncoder from 'gif-stream/encoder'
import neuquant from 'neuquant'
export default class GIF {
  static encode (key, storage, image) {
    let frame = image[key]
    let { palette, width, height, pixels } = frame

    let indexed = pixels

    if (frame.colorSpace !== 'index' || pixels.length !== width * height) {
      let q = neuquant.quantize(pixels)
      palette = q.palette
      indexed = q.indexed
    }

    let enc = new GIFEncoder(frame.width, frame.height, { palette })
    enc.pipe(storage.createWriteStream(`c-${key}.gif`))
    enc.end(indexed)
  }
}
