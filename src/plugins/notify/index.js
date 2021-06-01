import Vue from 'vue'
import Notifications from '@/components/Notify/Notifications.vue'

let id = 0

const Notify = {
  install (Vue) {
    if (Notify.installed) return
    let NotificationsConstructor = Vue.extend(Notifications)
    let _instance = new NotificationsConstructor()
    _instance.$mount()
    document.body.appendChild(_instance.$el)
    Vue.prototype.$notify = (payload) => {
      // Default values
      let notification = { id: id++, color: 'primary', text: '', close: true }
      const isString = typeof payload === 'string' || payload instanceof String
      if (isString) {
        notification.text = payload
      } else {
        notification = Object.assign(notification, payload)
      }
      _instance.add(notification)
      return id
    }
    Vue.prototype.$notify.removeByName = (name) => {
      _instance.removeByName(name)
    }
  },
}

Vue.use(Notify)
