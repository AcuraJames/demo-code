import Vue from 'vue'
import parseISO from 'date-fns/parseISO'
import fromUnixTime from 'date-fns/fromUnixTime'
import formatISO from 'date-fns/formatISO'

const DateFns = {
  install (Vue) {
    if (DateFns.installed) return
    Vue.prototype.$parseDate = (date) => {
      if (!date) return ''
      const isUnixTime = !Number.isNaN(Number(date))
      return isUnixTime
        ? fromUnixTime(date / 1000)
        : parseISO(date)
    }
    Vue.prototype.$toISOString = (date) => {
      if (!date) return ''
      return formatISO(date)
    }
  },
}

Vue.use(DateFns)
