import Promise from 'bluebird'
import _ from 'underscore'
import Frame from './frame'
import Logger from '../logger'
const log = Logger.get()

export default class Processor {
  constructor () {
    _.bindAll(this, 'processOne', 'process')
  }
  async processOne (image) {
    log.process('begin', `${image}`)
    let raw = image.raw
    let frame = image.frame = new Frame(raw).crop()
    frame.reindex0()
    // let { data, grid } = frame.reindex()


    // image.data = data
    // image.grid = grid

    // image.patched = (data && grid) ? data.patch(grid) : null

    // let nonEmptyChannels = _.chain(frame.hist)
    //   .pick((v, k) => v > 0 && k > 0)
    //   .keys()
    //   .value()
    // image.patched.threshold(nonEmptyChannels)
    //   .forEach((ch, i) => {
    //     image[`ch${nonEmptyChannels[i]}`] = ch
    //     // image[`m${nonEmptyChannels[i]}`] = ch.marchingSquare()
    //   })


    // if (!data) log.process('skip', `${image} appears to be empty`)
    log.process('end', `${image}`)

    return image
  }
  async process (images) {
    return await Promise.map(images, this.processOne.bind(this))
  }
}
