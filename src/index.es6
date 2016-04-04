import 'babel-polyfill'
import Logger from './logger'
import Promise from 'bluebird'

import { Station, Image } from './model'
import { FileStorage } from './storage'
import Delta from './delta'
import Processor from './processor'
import fetch from 'node-fetch'
import { decodeWith, decodeAllWith, GIF as GIFDecoder } from './decoder'
import { encodeWith, encodeAllWith, GIF as GIFEncoder, LZW, Json } from './encoder'
import { getOptions } from './options'
import { retry } from './util'
const fs = Promise.promisifyAll(require('graceful-fs'))

const log = Logger.get()
// var storage = new FileStorage('f:\\temp\\clouds')
// var storage = new FileStorage('f:\\temp\\cloud-single')
var storage = new FileStorage(process.cwd())
var delta = new Delta(storage)
var processor = new Processor(storage)

Promise.config({
  longStackTraces: true,
  // monitoring: true,
  cancellation: true
})

// var promises = []
// process.on('promiseCreated', (p) => {
//   promises.push(p)
// })
// // Image.load('http://image.nmc.cn/product/2016/03/28/RDCP/SEVP_AOC_RDCP_SLDAS_EBREF_AZ9010_L88_PI_20160328153500000.GIF?v=1459179358931')
// // Image.loadFromFile('./SEVP_AOC_RDCP_SLDAS_EBREF_AZ9010_L88_PI_20160328153500000.GIF')
// // Image.loadFromFile('./test.GIF')
// Image.load('http://image.nmc.cn/product/2016/03/30/RDCP/SEVP_AOC_RDCP_SLDAS_EBREF_AZ9010_L88_PI_20160330153500000.GIF?v=1459352159468')
// Image.load('http://image.nmc.cn/product/2016/03/30/RDCP/SEVP_AOC_RDCP_SLDAS_EBREF_AZ9970_L88_PI_20160330061000000.GIF?v=1459318097058')
// Image.load('http://image.nmc.cn/product/2016/03/31/RDCP/SEVP_AOC_RDCP_SLDAS_EBREF_AZ9070_L88_PI_20160330171500000.GIF?v=1459179358931')
// retry(() =>
//   // Image.load('http://image.nmc.cn/product/2016/03/31/RDCP/SEVP_AOC_RDCP_SLDAS_EBREF_AZ9220_L88_PI_20160330180000000.GIF?v=1459360741614')
//   Image.load('http://image.nmc.cn/product/2016/04/02/RDCP/SEVP_AOC_RDCP_SLDAS_EBREF_AZ9210_L88_PI_20160402080500000.GIF?v=1459584567796')
//   // Image.loadFromFile('./package.json')
//   // Image.loadFromFile('./test.GIF')
//     .then(decodeWith(GIFDecoder))
//     .then(processor.processOne)
//     .tap((img) => {
//       // console.log(img)
//     })
//     // .then(encodeWith('frame', GIFEncoder))
//     // .then(encodeWith('data', GIFEncoder))
//     // .then(encodeWith('grid', GIFEncoder))
//     .then(encodeWith('patched', GIFEncoder))
//     .then(encodeWith('ch1', GIFEncoder))
//     .then(encodeWith('ch2', GIFEncoder))
//     .then(encodeWith('ch3', GIFEncoder))
//     .then(encodeWith('ch4', GIFEncoder))
//     .then(encodeWith('ch5', GIFEncoder))
//     .then(encodeWith('ch6', GIFEncoder))
//     .then(encodeWith('ch7', GIFEncoder))
//     .then(encodeWith('ch8', GIFEncoder))
//     .then(encodeWith('ch9', GIFEncoder))
//     .then(encodeWith('ch10', GIFEncoder))
//     .then(encodeWith('ch11', GIFEncoder))
//     .then(encodeWith('ch12', GIFEncoder))
//     .then(encodeWith('ch13', GIFEncoder))
//     .then(encodeWith('ch14', GIFEncoder))
//     .then(encodeWith('ch15', GIFEncoder))
//     .then(encodeWith('ch16', GIFEncoder))
//
//     // .then(encodeWith('m1', Json))
//     //
//     // .then(encodeWith('m1', GIFEncoder))
//     // .then(encodeWith('m2', GIFEncoder))
//     // .then(encodeWith('m3', GIFEncoder))
//     // .then(encodeWith('m4', GIFEncoder))
//     // .then(encodeWith('m5', GIFEncoder))
//     // .then(encodeWith('m6', GIFEncoder))
//     // .then(encodeWith('m7', GIFEncoder))
//     // .then(encodeWith('m8', GIFEncoder))
//     // .then(encodeWith('m9', GIFEncoder))
//     // .then(encodeWith('m10', GIFEncoder))
//     // .then(encodeWith('m11', GIFEncoder))
//     // .then(encodeWith('m12', GIFEncoder))
//     // .then(encodeWith('m13', GIFEncoder))
//     // .then(encodeWith('m14', GIFEncoder))
//     // .then(encodeWith('m15', GIFEncoder))
//     // .then(encodeWith('m16', GIFEncoder))
//     // .then(encodeWith('patched', LZW))
//     .then(storage.writeOne),
//   getOptions().retry).catch((e) => console.error(e))

Station.listAll()
// Promise.resolve(require('../data.json'))
  // .tap((stations) => {
  //   console.log(`Feched ${stations.length} stations`)
  //   return fs.writeFileAsync('./data.json', JSON.stringify(stations, null, 2))
  // })
  .tap((stations) => {
    log.info('', `Listed ${stations.length} stations`)
  })
  .then(delta.update)
  .spread((toCache, toProcess) => {
    log.info('', `${toCache.length} new images`)
    log.info('', `${toProcess.length} cached images to be processed`)
    log.progress('fetch', 0, toCache.length)
    return Promise.map(toCache, (image) => {
        return retry(() => image.cache(storage), getOptions().retry)
          .tap(() => log.progress('fetch', 1))
      }, { concurrency: 5 })
      .then((cached) => cached.concat(toProcess))
  })
  .tap((images) => {
    // let pendingPromises = promises.filter((p) => p.isPending())
    // console.log(pendingPromises)
    log.info('', `${images.length} images to be processed`)
    log.progress('process', 0, images.length)
  })
  .map((image) => {
    return retry(
      () => Promise.resolve(image.loadFromCache(storage))
        .then(decodeWith(GIFDecoder))
        .then(processor.processOne)
        .then(encodeWith('frame', GIFEncoder))
        .then(encodeWith('frame', LZW))
        // .then(encodeWith('data', GIFEncoder))
        // .then(encodeWith('grid', GIFEncoder))
        // .then(encodeWith('patched', GIFEncoder))
        .then(storage.writeOne)
      , getOptions().retry)
        .tap(() => log.progress('process', 1))
  }, { concurrency: 50 })
  .then(() => {
    log.finish('process')
    log.info('', 'Done')
    process.exit()
  })
  .catch((e) => {
    log.info('', 'Done with errors')
    log.error(e)
    process.exit()
  })
