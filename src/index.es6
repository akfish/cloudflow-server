import 'babel-polyfill'
import { Station, Image } from './model'
import { FileStorage } from './storage'
import Delta from './delta'
import Processor from './processor'
import fetch from 'node-fetch'
import { decodeWith, GIF as GIFDecoder } from './decoder'
import { encodeWith, GIF as GIFEncoder } from './encoder'

import Promise from 'bluebird'

const fs = Promise.promisifyAll(require('fs'))


var storage = new FileStorage()
var delta = new Delta(storage)
var processor = new Processor(storage)

// Image.load('http://image.nmc.cn/product/2016/03/28/RDCP/SEVP_AOC_RDCP_SLDAS_EBREF_AZ9010_L88_PI_20160328153500000.GIF?v=1459179358931')
Image.loadFromFile('./SEVP_AOC_RDCP_SLDAS_EBREF_AZ9010_L88_PI_20160328153500000.GIF')
  .then(decodeWith(GIFDecoder))
  .then(processor.processOne)
  .tap((img) => {
    console.log(img)
  })
  .then(encodeWith(GIFEncoder))
  .then(storage.writeOne)

// Station.listAll()
// Promise.resolve(require('../data.json'))
  // .tap((stations) => {
  //   console.log(`Feched ${stations.length} stations`)
  //   return fs.writeFileAsync('./data.json', JSON.stringify(stations, null, 2))
  // })
  // .then(delta.update)
  // .tap((images) => {
  //   console.log(`Found ${images.length} images`)
  // })
  // .then(decodeAllWith(GIFDecoder))
  // .then(processor.process)
  // .then(encodeAllWith(GIFEncoder))
  // .then(storage.write)
