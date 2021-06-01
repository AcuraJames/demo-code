<script>
import { convertToUnit } from '@/util/helpers'

export default {
  name: 'Icon',
  props: {
    iconName: {
      type: String,
      default: '',
    },
    title: {
      type: [String, Object],
      default: '',
    },
    size: {
      type: [String, Number],
      default: 18,
    },
    color: {
      type: String,
      default: 'currentColor',
    },
  },
  computed: {
    path () {
      return `@/assets/icons/${this.iconName}.svg`
    },
  },
  render (createElement) {
    const h = createElement
    const attrs = {
      xmlns: 'http://www.w3.org/2000/svg',
      width: this.size,
      height: this.size,
      viewBox: '0 0 24 24',
    }
    const size = convertToUnit(this.size)
    if (this.iconName) {
      return h('i', {}, [
        h('img', {
          attrs: {
            src: this.path,
          },
        }),
      ])
    } else if (this.$slots.default[0].text) {
      return h('svg', {
        attrs,
        style: {
          width: size,
          height: size,
          'font-size': size,
          color: this.color,
        },
      },
      [h('title',
        this.title,
      ),
      [h('g', {
        attrs: {
          fill: this.color,
        },
      },
      [h('path', {
        attrs: {
          d: this.$slots.default[0].text,
        },
      })])]])
    }
    return null
    // else {
    //   const comp = this.$slots.default[0]
    //   comp.componentOptions.propsData = {
    //     width: attrs.width,
    //     height: attrs.height,
    //     styles: {
    //       width: size,
    //       height: size,
    //       'font-size': size,
    //     },
    //   }
    //   return comp
    // }
  },
}
</script>
