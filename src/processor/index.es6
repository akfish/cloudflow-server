import Promise from 'bluebird'
import fetch from 'node-fetch'
import toArray from 'stream-to-array'
import GIFDecoder from 'gif-stream/decoder'
import ConcatFrames from 'concat-frames'
import { cropFrame } from '../util'
import { ROI } from '../consts'
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
  async processOne (image) {
    let raw = image.raw
    let cropped = image.frame = this._crop(raw)

    return image
  }
  async process (images) {
    return await Promise.map(images, this.processOne.bind(this))
  }
}
