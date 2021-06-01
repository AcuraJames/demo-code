import Vue from 'vue'
import Vuetify from './framework'
import VMenu from 'vuetify/lib/components/VMenu'
import VTooltip from 'vuetify/lib/components/VTooltip'
import VDialog from 'vuetify/lib/components/VDialog'
import VDatePicker from 'vuetify/lib/components/VDatePicker'
import VWindow from 'vuetify/lib/components/VWindow'
import VProgressCircular from 'vuetify/lib/components/VProgressCircular'
import VImg from 'vuetify/lib/components/VImg'
import transitions from 'vuetify/lib/components/transitions'

Vue.use(Vuetify, {
  components: {
    VMenu,
    VTooltip,
    VDialog,
    VDatePicker,
    VWindow,
    VProgressCircular,
    VImg,
    transitions,
  },
})

export default new Vuetify({
  theme: { disable: true },
  breakpoint: {
    thresholds: {
      xs: 340,
      sm: 640,
      md: 768,
      lg: 1024,
    },
    scrollBarWidth: 16,
  },
})
