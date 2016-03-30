import Promise from 'bluebird'
import fetch from 'node-fetch'
import toArray from 'stream-to-array'
import GIFDecoder from 'gif-stream/decoder'
import ConcatFrames from 'concat-frames'
import { cropFrame } from '../util'
import { ROI, PALETTE, PALETTE_BUFFER } from '../consts'
import fs from 'fs'
import _ from 'underscore'


export default class Processor {
  constructor () {
    _.bindAll(this, 'processOne', 'process')
  }
  _crop (frame) {
    let cropped = cropFrame(frame, ROI[`${frame.width}x${frame.height}`])

    return cropped
  }
  _reindex (frame) {
    let { palette, pixels } = frame

    let indexed = new Buffer(pixels.length / 3)
    let grid = new Buffer(pixels.length / 3)

    for (var i = 0; i < pixels.length; i += 3) {
      let r = pixels[i]
      let g = pixels[i + 1]
      let b = pixels[i + 2]
      let v = r << 16 | g << 8 | b
      let j = PALETTE.indexOf(v)
      console.assert(j >= 0)
      if (j < 16) {
        // TODO: update bounding box
        indexed.writeUInt8(j, i / 3)
        grid.writeUInt8(0, i / 3)
      } else {
        indexed.writeUInt8(0, i / 3)
        grid.writeUInt8(j, i / 3)
      }
    }

    frame.indexed = indexed
    frame.grid = grid
    frame.palette = PALETTE_BUFFER

    return frame
  }
  async processOne (image) {
    let raw = image.raw
    let frame = image.frame = this._crop(raw)
    this._reindex(frame)

    return image
  }
  async process (images) {
    return await Promise.map(images, this.processOne.bind(this))
  }
}
