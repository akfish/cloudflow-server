import Promise from 'bluebird'
import _ from 'underscore'
import url from 'url'
import path from 'path'
import { retry } from '../util'
const fs = Promise.promisifyAll(require('graceful-fs'))
const mkdirp = Promise.promisify(require('mkdirp'))
import Logger from '../logger'
const log = Logger.get()

export default class FileStorage {
  constructor (base = __dirname) {
    this.base = base
    _.bindAll(this, 'createWriteStream', 'exists', 'writeOne')
  }
  createImageWriteStream (image) {
    this.resolve(image)
    let { dir, name } = image.file
    let output = path.join(dir, `${name}.gif`)
    return mkdirp(dir)
      .then(() => fs.createWriteStream(output))
  }
  createReadStream (filename) {
    return fs.createReadStream(filename)
  }
  createWriteStream (filename) {
    return fs.createWriteStream(filename)
  }
  writeFile (...args) {
    return fs.writeFileAsync(...args)
  }
  resolve (image) {
    if (typeof image.file === 'object') return
    let file = path.parse(path.join(this.base, url.parse(image.url).pathname))
    image.file = file
  }
  async exists (image, surfix = '') {
    this.resolve(image)
    let { dir, name } = image.file
    let output = path.join(dir, `${name}${surfix}.gif`)
    try {
      let stat = await fs.statAsync(output)
      return stat.isFile()
    } catch (e) {
      return false
    }
  }
  async writeOne (image) {
    log.storage('begin', `${image}`)
    this.resolve(image)
    await mkdirp(image.file.dir)
    await Promise.map(image.encoders, (encode) => encode(this, image))
      // .timeout(3000, new Error(`Write ${image} timeout`))
    log.storage('end', `${image}`)
    return image
  }
  async write (images) {
    return await Promise.map(images, this.writeOne.bind(this))
      .then(() => log.storage('all', `written ${images.length} images`))
  }
}
