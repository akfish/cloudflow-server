import _ from 'underscore'

export const DEFAULT_OPTIONS = {
  retry: 5,
  timeout: 5000,
  logger: 'verbose'
}

var opts = null

export function setOptions (o) {
  opts = _.defaults({}, opts, DEFAULT_OPTIONS, o)
}

export function getOptions () {
  return opts || _.clone(DEFAULT_OPTIONS)
}
