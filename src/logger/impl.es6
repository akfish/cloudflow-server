import _ from 'underscore'
import log from 'npmlog'

export default class Impl {
  constructor () {
    this.addLevelLike('fetch')
    this.addLevelLike('parse')
    this.addLevelLike('decode')
    this.addLevelLike('process')
    this.addLevelLike('encode')
    this.addLevelLike('storage')
    this.levels.forEach((level) => this[level] = this._invokeLogger.bind(this, level))
    this._progressItems = {}
  }
  addLevelLike (lvl, like = 'info', style, disp) {
    let { levels, style: s, disp: d } = log
    log.addLevel(lvl, levels[like], style || s[like], disp)
  }
  _invokeLogger (method, ...args) {
    log[method](...args)
  }
  get levels () { return _.keys(log.levels) }
  progress (name, addDone, addTodo) {
    let bar = this._progressItems[name]
    if (!bar) {
      log.enableProgress()
      this._progressItems[name] = bar = log.newItem(name)
    }
    if (_.isNumber(addDone)) bar.completeWork(addDone)
    if (_.isNumber(addTodo)) bar.addWork(addTodo)
  }
  finish (name) {
    let bar = this._progressItems[name]
    if (!bar) return
    bar.finish()
  }
}
