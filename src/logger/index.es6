import _ from 'underscore'
import { getOptions } from '../options'

const IMPL = ['verbose'].reduce((I, i) => {
    I[i] = require(`./${i}`)
    return I
  }, {})

var logger = null
export default class Logger {
  static get () {
    if (!logger) {
      let opts = getOptions()
      logger = new Logger(new IMPL[opts.logger](), opts)
    }
    return logger
  }
  constructor (impl, opts) {
    this.impl = impl
    this.opts = opts
    impl.levels.forEach((level) => this[level] = this._invokeImpl.bind(this, level))

    ;[
      'progress',
      'finish'
    ].forEach((method) => this[method] = this._invokeImpl.bind(this, method))
  }
  _invokeImpl (method, ...args) {
    this.impl[method](...args)
  }
}
