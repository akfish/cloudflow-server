import Promise from 'bluebird'
import fetch from 'node-fetch'
import { URL, REGEX } from './consts'
import { matchAll } from './util'
import _ from 'underscore'

function parseImages (text) {
  let images = matchAll(REGEX.IMAGE, text, ['url', 'YYYY', 'MM', 'DD', 'HH', 'mm'])
  return images
}

function parseStations (text) {
  let stations = _.chain(matchAll(REGEX.STATION, text, ['url', 'name', 'name_cn']))
    .filter(({name}) => name !== 'index')
    .uniq(({name_cn}) => name_cn)
    .each((station) => {
      station.url = URL.resolve(station.url)
    })
    .value()
  return stations
}

async function fetchPage (url) {
  console.log(`[Fecth] ${url}`)
  let res = await fetch(url)
  let text = await res.text()

  console.log(`[Fetched] ${url}`)
  let stations = parseStations(text)
  let images = parseImages(text)
  console.log(`[Parse] ${stations.length} stations, ${images.length} images`)
  return { url, stations, images }
}

export async function getAllStations () {
  let queue = [URL.INDEX]
  let visited = {}
  let images = {}
  let all = []

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
  }

  all.forEach((station) => station.images = images[station.url])

  return all
}
