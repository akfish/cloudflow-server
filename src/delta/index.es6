import Promise from 'bluebird'
import _ from 'underscore'
import Logger from '../logger'

const log = Logger.get()

export default class Delta {
  constructor (storage) {
    this.storage = storage
    _.bindAll(this, 'update')
  }
  async update (stations) {
    let { storage } = this
    let images = _.chain(stations)
      .pluck('images')
      .flatten()
      .value()

    log.info('', `Listed ${images.length} images`)

    return Promise.filter(images, async (image) => {
      let exists = await storage.exists(image)
      return !exists
    }, { concurrency: 10 })
  }
}
