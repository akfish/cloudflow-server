import 'babel-polyfill'
import Promise from 'bluebird'
import { Station, Image } from './model'
import { FileStorage } from './storage'
import Delta from './delta'
import Processor from './processor'
import fetch from 'node-fetch'
import { decodeWith, decodeAllWith, GIF as GIFDecoder } from './decoder'
import { encodeWith, encodeAllWith, GIF as GIFEncoder } from './encoder'
import { getOptions } from './options'
import { retry } from './util'
const fs = Promise.promisifyAll(require('graceful-fs'))

var storage = new FileStorage('f:\\temp\\clouds')
var delta = new Delta(storage)
var processor = new Processor(storage)

// // Image.load('http://image.nmc.cn/product/2016/03/28/RDCP/SEVP_AOC_RDCP_SLDAS_EBREF_AZ9010_L88_PI_20160328153500000.GIF?v=1459179358931')
// // Image.loadFromFile('./SEVP_AOC_RDCP_SLDAS_EBREF_AZ9010_L88_PI_20160328153500000.GIF')
// // Image.loadFromFile('./test.GIF')
// Image.load('http://image.nmc.cn/product/2016/03/30/RDCP/SEVP_AOC_RDCP_SLDAS_EBREF_AZ9010_L88_PI_20160330153500000.GIF?v=1459352159468')
// Image.load('http://image.nmc.cn/product/2016/03/30/RDCP/SEVP_AOC_RDCP_SLDAS_EBREF_AZ9970_L88_PI_20160330061000000.GIF?v=1459318097058')
// Image.load('http://image.nmc.cn/product/2016/03/31/RDCP/SEVP_AOC_RDCP_SLDAS_EBREF_AZ9070_L88_PI_20160330171500000.GIF?v=1459179358931')
// retry(() =>
//   // Image.load('http://image.nmc.cn/product/2016/03/31/RDCP/SEVP_AOC_RDCP_SLDAS_EBREF_AZ9220_L88_PI_20160330180000000.GIF?v=1459360741614')
//   Image.loadFromFile('./unknown-color.gif')
//     .then(decodeWith(GIFDecoder))
//     .then(processor.processOne)
//     .tap((img) => {
//       // console.log(img)
//     })
//     .then(encodeWith('frame', GIFEncoder))
//     .then(encodeWith('data', GIFEncoder))
//     .then(encodeWith('grid', GIFEncoder))
//     .then(encodeWith('patched', GIFEncoder))
//     .then(storage.writeOne),
//   getOptions().retry)
//
Station.listAll()
// Promise.resolve(require('../data.json'))
  .tap((stations) => {
    console.log(`Feched ${stations.length} stations`)
    return fs.writeFileAsync('./data.json', JSON.stringify(stations, null, 2))
  })
  // .then((stations) => stations.slice(0, 1))
  .then(delta.update)
  .tap((images) => {
    console.log(`Found ${images.length} images`)
  })
  .then((images) => Promise.map(images, (image) => {
    return retry(
      () => image.load()
        .then(decodeWith(GIFDecoder))
        .then(processor.processOne)
        .then(encodeWith('frame', GIFEncoder))
        .then(encodeWith('data', GIFEncoder))
        .then(encodeWith('grid', GIFEncoder))
        .then(encodeWith('patched', GIFEncoder))
        .then(storage.writeOne)
      , getOptions().retry).timeout(30000)
  }/*, { concurrency: 20 }*/))
