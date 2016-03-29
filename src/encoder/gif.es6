import GIFEncoder from 'gif-stream/encoder'
import neuquant from 'neuquant'
export default class GIF {
  static encode (storage, { frame }) {
    let { palette, indexed } = frame
    if (!indexed) {
      let q = neuquant.quantize(frame.pixels)
      palette = q.palette
      indexed = q.indexed
    }

    let enc = new GIFEncoder(frame.width, frame.height, { palette })
    enc.pipe(storage.createWriteStream('c.gif'))
    enc.end(indexed)
  }
}
