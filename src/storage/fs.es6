import Promise from 'bluebird'
import _ from 'underscore'
const fs = Promise.promisifyAll(require('fs'))

export default class FileStorage {
  constructor (base) {
    this.base = base
    _.bindAll(this, 'createWriteStream', 'exists', 'writeOne')
  }
  createWriteStream (filename) {
    // TODO: resolve against base
    return fs.createWriteStream(filename)
  }
  async exists (image) {
    return false
  }
  async writeOne (image) {
    // TODO: resolve image paths
    await Promise.map(image.encoders, (encode) => encode(this, image))
    return image
  }
  async write (images) {
    return await Promise.map(images, this.writeOne.bind(this))
  }
}
