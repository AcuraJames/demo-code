import Vue from 'vue'
import VueI18n from 'vue-i18n'
import { CURRENT_LANG_STORE_KEY } from '../../config/globals'

Vue.use(VueI18n)

function loadLocaleMessages () {
  const locales = require.context('../../locales', true, /[A-Za-z0-9-_,\s]+\.json$/i)
  const messages = {}
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i)
    if (matched && matched.length > 1) {
      const locale = matched[1]
      messages[locale] = locales(key)
    }
  })
  return messages
}

const dateTimeFormats = {
  'en': {
    time: {
      hour: 'numeric',
      minute: 'numeric',
    },
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    },
    long: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
    },
  },
  'ru': {
    time: {
      hour: 'numeric',
      minute: 'numeric',
    },
    short: {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    },
    long: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    },
  },
}

const numberFormats = {
  'en': {
    currency: {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    },
    decimal: {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    integer: {
      maximumFractionDigits: 0,
    },
    formatted: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  },
  'ru': {
    currency: {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 2,
    },
    decimal: {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    integer: {
      maximumFractionDigits: 0,
    },
    formatted: {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  },
}

export default new VueI18n({
  locale: localStorage.getItem(CURRENT_LANG_STORE_KEY) || process.env.VUE_APP_I18N_LOCALE || 'en',
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  messages: loadLocaleMessages(),
  dateTimeFormats,
  numberFormats,
})
