import GIFEncoder from 'gif-stream/encoder'
import neuquant from 'neuquant'
export default class GIF {
  static encode (storage, { frame }) {
    let q = neuquant.quantize(frame.pixels)
    let enc = new GIFEncoder(frame.width, frame.height, { palette: q.palette })
    enc.pipe(storage.createWriteStream('c.gif'))
    enc.end(q.indexed)
  }
}
