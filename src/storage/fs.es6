import Promise from 'bluebird'
import _ from 'underscore'
import url from 'url'
import path from 'path'
const fs = Promise.promisifyAll(require('fs'))
const mkdirp = Promise.promisify(require('mkdirp'))

export default class FileStorage {
  constructor (base = __dirname) {
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
    let file = path.parse(path.join(this.base, url.parse(image.url).pathname))
    image.file = file
    await mkdirp(file.dir)
    await Promise.map(image.encoders, (encode) => encode(this, image))
    return image
  }
  async write (images) {
    return await Promise.map(images, this.writeOne.bind(this))
  }
}
