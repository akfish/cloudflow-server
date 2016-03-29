import Promise from 'bluebird'
import _ from 'underscore'

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

    return Promise.filter(images, async (image) => {
      let exists = await storage.exists(image)
      return !exists
    })
  }
}
