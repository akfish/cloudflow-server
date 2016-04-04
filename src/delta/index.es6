import Promise from 'bluebird'
import _ from 'underscore'
import Logger from '../logger'

const log = Logger.get()

export default class Delta {
  constructor (storage) {
    this.storage = storage
    _.bindAll(this, 'update')
  }
  update (stations) {
    let { storage } = this
    let images = _.chain(stations)
      .pluck('images')
      .flatten()
      .value()

    log.info('', `Listed ${images.length} images`)

    log.progress('stat', 0, images.length)

    return Promise.map(images, (image) => {
        return Promise.all([
          storage.exists(image),
          storage.exists(image, '-frame'),
        ], { concurrency: 10 })
        .spread((cached, processed) => {
          image.cached = cached
          image.processed = processed
          log.progress('stat', 1)
          return image
        })
      })
      .tap(() => {
        log.finish('stat')
      })
      .then((images) => {
        let toCache = []
        let toProcess = []
        log.progress('delta', 0, images.length)
        images.forEach((image) => {
          let { cached, processed } = image
          if (!cached) {
            toCache.push(image)
          } else if (!processed) {
            toProcess.push(image)
          }
          log.progress('delta', 1)
        })
        log.finish('delta')
        return [toCache, toProcess]
      })
  }
}
