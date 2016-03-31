import _ from 'underscore'

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

export function streamToPromise (stream) {
  return new Promise((resolve, reject) => {
    stream.on("end", resolve)
    stream.on("error", reject)
  })
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

  while (tried < count) {
    try {
      if (tried > 0) console.log(`Retry ${tried}/${count}`)
      return await fn()
    } catch (e) {
      tried++
      console.error(`[Error] `, e)
    }
  }

  throw new Error('Maxiumum retry count exceeded')
}
