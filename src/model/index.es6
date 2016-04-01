import Promise from 'bluebird'
import fetch from 'node-fetch'
import { URL, REGEX } from '../consts'
import { matchAll, retry } from '../util'
import { getOptions } from '../options'
import _ from 'underscore'
import Logger from '../logger'
const log = Logger.get()
const fs = Promise.promisifyAll(require('graceful-fs'))

export function tryFetchText (url, opts) {
  let { retry: maxRetry, timeout } = opts = _.defaults({}, opts, { retry: 0, timeout: 0 })

  return retry(() =>
    fetch(url, opts)
      .then((res) => res.text())
  , maxRetry)
}

function parseImages (text) {
  let images = matchAll(REGEX.IMAGE, text, ['url', 'YYYY', 'MM', 'DD', 'HH', 'mm'], Image)

  images.forEach((image) => image.url = URL.resolveImage(image.url))

  return images
}

function parseStations (text) {
  let stations = _.chain(matchAll(REGEX.STATION, text, ['url', 'name', 'name_cn'], Station))
    .filter(({name}) => name !== 'index')
    .uniq(({name_cn}) => name_cn)
    .each((station) => {
      station.url = URL.resolve(station.url)
    })
    .value()
  return stations
}

async function fetchPage (url) {
  log.fetch('begin', url)
  let text = await tryFetchText(url, getOptions())

  log.fetch('end', url)
  let stations = parseStations(text)
  let images = parseImages(text)
  log.parse('done', `${stations.length} stations, ${images.length} images`)
  return { url, stations, images }
}

async function getAllStations () {
  let queue = [URL.INDEX]
  let visited = {}
  let images = {}
  let all = []

  let queued = 1
  let resolved = 0

  log.progress('stations', 0, 1)
  while (queue.length > 0) {
    let pages = await Promise.map(queue, fetchPage)

    let stations = _.chain(pages)
      .each(({url, images: imgs}) => {
        // Mark visited
        visited[url] = true
        // Store images
        images[url] = imgs
      })
      .pluck('stations')
      .flatten()
      .uniq(({name_cn}) => name_cn)
      .value()

    all = all.concat(stations)

    // New queue
    queue = _.chain(stations)
      .filter(({url}) => !visited[url])
      .pluck('url')
      .value()
    resolved += pages.length
    queued += queue.length
    log.progress('stations', pages.length, queue.length)
  }

  all.forEach((station) => {
    station.images = images[station.url]
    station.images.forEach((image) => {
      image.station = station.name
      image.station_cn = station.name_cn
    })
  })

  log.finish('stations')

  return all
}

class Model {
  constructor (payload) {
    _.extend(this, payload)
  }
}

export class Station extends Model {
  static async listAll () {
    return getAllStations()
  }
  static async list (url) {
    return fetchPage(url)
  }
}

export class Image extends Model {
  static async load (url) {
    return new Image({ url }).load()
  }
  static async loadFromFile (file) {
    let img = new Image({ url: file })
    img.stream = fs.createReadStream(file)
    return img
  }
  async load () {
    log.fetch('begin', `${this}`)
    let res = await fetch(this.url, getOptions())

    this.stream = res.body

    console.assert(this.stream._readableState.length > 0, 'Empty response')

    log.fetch('end', `${this}`)

    return this
  }

  toString () {
    let { station_cn, YYYY, MM, DD, HH, mm } = this
    return `${station_cn} ${YYYY}/${MM}/${DD} ${HH}:${mm}`
  }
}
