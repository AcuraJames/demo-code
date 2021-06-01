import Vue from 'vue'
import App from './App.vue'
import router from './router'
import {
  i18n,
  vuetify,
  apolloProvider,
} from './plugins'

// Base components
import './components'

// Tailwindcss
import './assets/css/main.css'

Vue.config.productionTip = false

new Vue({
  router,
  i18n,
  vuetify,
  apolloProvider,
  render: h => h(App),
}).$mount('#app')
