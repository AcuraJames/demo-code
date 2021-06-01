import Vue from 'vue'
import Auth from './Auth'

const _instance = new Auth()

const AuthPlugin = {
  install (Vue) {
    if (AuthPlugin.installed) return
    Object.defineProperties(Vue.prototype, {
      $Auth: {
        get () {
          return _instance
        },
      },
    })
  },
}

Vue.use(AuthPlugin)

export default _instance
