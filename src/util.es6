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

export function cropFrame (frame, rect) {
  // Assume frame.colorSpace === 'rgb'
  let { width: w, height: h, palette, pixels, colorSpace } = frame
  console.assert(colorSpace === 'rgb')
  let [ left, top, width, height ] = rect
  let strides = []
  for (let y = top; y < top + height; y++) {
    let offset = y * w * 3 + left * 3
    strides.push(pixels.slice(offset, offset + width * 3))
  }
  return {
    x: 0,
    y: 0,
    width,
    height,
    colorSpace,
    palette,
    pixels: Buffer.concat(strides)
  }
}
