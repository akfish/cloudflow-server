import Promise from 'bluebird'
import fetch from 'node-fetch'
import toArray from 'stream-to-array'
import GIFDecoder from 'gif-stream/decoder'
import ConcatFrames from 'concat-frames'
import { cropPixels } from '../util'
import { ROI, PALETTE, PALETTE_BUFFER } from '../consts'
import _ from 'underscore'

class Frame {
  constructor (...args) {
    _.extend(this, ...args)
  }
  crop (roi) {
    let { colorSpace, palette, pixels, width, height } = this
    roi = roi || ROI[`${width}x${height}`]
    console.assert(typeof roi === 'object')

    pixels = cropPixels(pixels, width, height, roi)

    return new Frame({
      colorSpace,
      x: roi[0],
      y: roi[1],
      width: roi[2],
      height: roi[3],
      pixels,
      palette
    })
  }
  reindex () {
    let { palette, pixels, width, height } = this
    let left = width
    let top = height
    let right = 0
    let bottom = 0

    let indexed = new Buffer(pixels.length / 3)
    let data = new Buffer(pixels.length / 3)
    let grid = new Buffer(pixels.length / 3)

    for (var i = 0; i < pixels.length; i += 3) {
      let r = pixels[i]
      let g = pixels[i + 1]
      let b = pixels[i + 2]
      let v = r << 16 | g << 8 | b
      let j = PALETTE.indexOf(v)
      let x = i / 3 % width
      let y = ~~ (i / 3 / width)
      console.assert(j >= 0, `Unknown color: ${r}, ${g}, ${b} at (${x}, ${y})`)
      indexed.writeUInt8(j, i / 3)
      if (j < 16) {
        if (j > 0) {
          // update bounding box
          left = Math.min(left, x)
          right = Math.max(right, x)
          top = Math.min(top, y)
          bottom = Math.max(bottom, y)
        }

        data.writeUInt8(j, i / 3)
        grid.writeUInt8(0, i / 3)
      } else {
        data.writeUInt8(0, i / 3)
        grid.writeUInt8(j, i / 3)
      }
    }

    this.colorSpace = 'indexed'
    this.pixels = indexed
    this.palette = PALETTE_BUFFER

    // No pixels
    if (left === width) left = 0
    if (top === height) top = 0

    let meta = {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
      colorSpace: 'indexed',
      palette: PALETTE_BUFFER
    }

    let roi = [meta.x, meta.y, meta.width, meta.height]

    let dataFrame = null
    let gridFrame = null

    if (meta.width > 0 && meta.height > 0) {
      dataFrame = new Frame(_.defaults({ pixels: cropPixels(data, width, height, roi, 1) }, meta))
      gridFrame = new Frame(_.defaults({ pixels: cropPixels(grid, width, height, roi, 1) }, meta))
    }

    return { data: dataFrame, grid: gridFrame }
  }

  patch (maskFrame) {
    console.assert(maskFrame.width === this.width && maskFrame.height === this.height)
    console.assert(maskFrame.colorSpace === this.colorSpace)

    let { height, width, pixels: data } = this
    let { pixels: mask } = maskFrame

    let patched = new Buffer(data.length)

    data.copy(patched)
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let i = y * width + x
        let m = mask[i]
        // Not missing
        if (m === 0) continue
        let N8 = [
          data[(y - 1) * width + x - 1],
          data[(y - 1) * width + x],
          data[(y - 1) * width + x + 1],
          data[y * width + x + 1],
          data[(y + 1) * width + x + 1],
          data[(y + 1) * width + x],
          data[(y + 1) * width + x - 1],
          data[y * width + x - 1]
        ]
        let [NW, N, NE, E, SE, S, SW, W] = N8

        // No N4 neighbour, skip
        if (N === 0 && E === 0 && W === 0 && S === 0) continue
        if (N >= 16 && E >= 16 && W >= 16 && S >= 16) continue

        let fix = 0
        let count = 0
        N8.forEach((n, i) => {
          if (n >= 16) return
          fix += n
          count++
        })

        patched[i] = Math.ceil(fix / (count > 0 ? count : 1))
      }
    }
    return new Frame(_.extend({ pixels: patched }, _.omit(this, 'pixels')))
  }
}

export default class Processor {
  constructor () {
    _.bindAll(this, 'processOne', 'process')
  }
  async processOne (image) {
    console.log(`[Processing] ${image.url}`)
    let raw = image.raw
    let frame = image.frame = new Frame(raw).crop()
    let { data, grid } = frame.reindex()

    image.data = data
    image.grid = grid

    image.patched = (data && grid) ? data.patch(grid) : null
    if (!data) console.log(`[Process] SKIP ${image.url} appears to be empty`)
    console.log(`[Processed] ${image.url}`)

    return image
  }
  async process (images) {
    return await Promise.map(images, this.processOne.bind(this))
  }
}
