import _ from 'underscore'

function identity (m) { return m }

function toObject (keys, m) {
  return _.object(keys, m.slice(1))
}

export function matchAll (r, text, transform) {
  let m = r.exec(text)
  let matches = []
  if (_.isArray) {
    transform = toObject.bind(null, transform)
  } else if (!transform || !_.isFunction(transform)) {
    transform = identity
  }

  while (m) {
    let token = transform(m)
    matches.push(token)
    m = r.exec(text)
  }

  return matches
}
