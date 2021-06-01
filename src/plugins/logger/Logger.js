const LOG_LEVEL = {
  VERBOSE: 1,
  DEBUG: 2,
  INFO: 3,
  WARN: 4,
  ERROR: 5,
}

export default class Logger {
  constructor (name, level = 'WARN') {
    this.name = name
    this.level = level
  }
  _padding (n) {
    return n < 10 ? '0' + n : '' + n
  }
  _ts () {
    const dt = new Date()
    return [
      this._padding(dt.getMinutes()),
      this._padding(dt.getSeconds()),
    ].join(':') + '.' + dt.getMilliseconds()
  }
  _log (type, ...msg) {
    let loggerLevelName = this.level
    // override log level if setted globally
    if (typeof window !== 'undefined' && window.LOG_LEVEL) {
      loggerLevelName = window.LOG_LEVEL
    }
    const loggerLevel = LOG_LEVEL[loggerLevelName]
    const typeLevel = LOG_LEVEL[type]
    if (!(typeLevel >= loggerLevel)) {
      return
    }

    let log = console.log.bind(console) // eslint-disable-line no-console
    if (type === 'ERROR' && console.error) { log = console.error.bind(console) } // eslint-disable-line no-console
    if (type === 'WARN' && console.warn) { log = console.warn.bind(console) } // eslint-disable-line no-console

    let prefix = `[${type}] ${this._ts()}`
    if (this.name) {
      prefix += ` ${this.name}`
    }

    if (msg.length === 1 && typeof msg[0] === 'string') {
      log(`${prefix} - ${msg[0]}`)
    } else if (msg.length === 1) {
      log(prefix, msg[0])
    } else if (typeof msg[0] === 'string') {
      let obj = msg.slice(1)
      if (obj.length === 1) { obj = obj[0] }
      log(`${prefix} - ${msg[0]}`, obj)
    } else {
      log(prefix, msg)
    }
  }
  log (...msg) { this._log('INFO', ...msg) }
  error (...msg) { this._log('ERROR', ...msg) }
  warn (...msg) { this._log('WARN', ...msg) }
  info (...msg) { this._log('INFO', ...msg) }
  debug (...msg) { this._log('DEBUG', ...msg) }
  verbose (...msg) { this._log('VERBOSE', ...msg) }
}
