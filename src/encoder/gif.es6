import GIFEncoder from 'gif-stream/encoder'
import neuquant from 'neuquant'
export default class GIF {
  static encode (key, storage, { frame }) {
    let { palette, width, height } = frame
    let indexed = frame[key]

    if (!indexed || indexed.length !== width * height) {
      let q = neuquant.quantize(indexed || frame.pixels)
      palette = q.palette
      indexed = q.indexed
    }

    let enc = new GIFEncoder(frame.width, frame.height, { palette })
    enc.pipe(storage.createWriteStream(`c-${key}.gif`))
    enc.end(indexed)
  }
}
