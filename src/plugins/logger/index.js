import Vue from 'vue'
import Logger from './Logger'

const level = process.env.NODE_ENV === 'production' ? 'WARN' : 'INFO'

// global logger instance
const _instance = new Logger(null, level)

const LoggerPlugin = {
  install (Vue) {
    if (LoggerPlugin.installed) return
    Object.defineProperties(Vue.prototype, {
      $logger: {
        get () {
          return {
            log: (...msg) => {
              _instance.log(...msg)
            },
            error: (...msg) => {
              _instance.error(...msg)
            },
            warn: (...msg) => {
              _instance.warn(...msg)
            },
            info: (...msg) => {
              _instance.info(...msg)
            },
            debug: (...msg) => {
              _instance.debug(...msg)
            },
            verbose: (...msg) => {
              _instance.verbose(...msg)
            },
          }
        },
      },
      $Logger: {
        get () {
          return Logger
        },
      },
    })
  },
}

Vue.use(LoggerPlugin)

export default Logger
