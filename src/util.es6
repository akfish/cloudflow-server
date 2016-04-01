import Promise from 'bluebird'
import _ from 'underscore'
import Logger from './logger'

const log = Logger.get()

function identity (m) { return m }

function toObject (keys, m) {
  return _.object(keys, m.slice(1))
}

export function matchAll (r, text, transform, Model) {
  let m = r.exec(text)
  let matches = []
  if (_.isArray) {
    transform = toObject.bind(null, transform)
  } else if (!transform || !_.isFunction(transform)) {
    transform = identity
  }

  while (m) {
    let token = transform(m)
    if (Model) token = new Model(token)
    matches.push(token)
    m = r.exec(text)
  }

  return matches
}

export function cropPixels (pixels, w, h, rect, dimension = 3) {
  // Assume frame.colorSpace === 'rgb'
  let [ left, top, width, height ] = rect
  let strides = []
  for (let y = top; y < top + height; y++) {
    let offset = y * w * dimension + left * dimension
    strides.push(pixels.slice(offset, offset + width * dimension))
  }
  return Buffer.concat(strides)
}

export async function retry (fn, count) {
  let tried = 0

  if (count === 0) return await fn()

  let promise = null
  while (tried < count) {
    try {
      if (promise != null) promise.cancel()
      if (tried > 0) log.warn('retry', `${tried}/${count}`)
      promise = Promise.resolve(fn())
      return await promise
    } catch (e) {
      tried++
      log.error('', e.message)
    }
  }

  throw new Error('Maxiumum retry count exceeded')
}
