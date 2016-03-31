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

    let checked = 0
    return Promise.filter(images, async (image) => {
      try {
        let exists = await storage.exists(image)
        checked++
        return !exists
      } catch (e) {
        console.log(checked)
        throw e
      }
    }, { concurrency: 10 })
  }
}
