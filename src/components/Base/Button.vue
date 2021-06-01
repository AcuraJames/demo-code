<template>
  <button
    :class="[
      'button',
      //color modificators
      {'button--white': white},
      {'button--gray': gray},
      {'button--secondary': secondary},
      //state modificators
      {'button--text': text},
      {'button--squared': squared},
      {'button--outline': outline},
      {'button--disabled': disabled},
      //size modificators
      {'button--small': small},
      {'button--large': large},
      //icon prepend element
      {'button__icon': $slots.icon}
    ]"
    :style="`width:${width}px`"
    :disabled="disabled"
    :value="internalValue"
    @click="$emit('click', $event)"
  >
    <span v-if="$slots.text" class="button__prepend-text">
      <slot name="text" />
    </span>
    <div v-if="$slots.icon" class="button__prepend-icon">
      <slot name="icon" />
    </div>
    <slot />
  </button>
</template>

<script>
import { convertToUnit } from '@/util/helpers'

export default {
  name: 'Button',
  props: {
    white: {
      type: Boolean,
      default: false,
    },
    gray: {
      type: Boolean,
      default: false,
    },
    secondary: {
      type: Boolean,
      default: false,
    },
    text: {
      type: Boolean,
      default: false,
    },
    outline: {
      type: Boolean,
      default: false,
    },
    squared: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    small: {
      type: Boolean,
      default: false,
    },
    large: {
      type: Boolean,
      default: false,
    },
    width: {
      type: [String, Number],
      default: '',
    },
    value: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      checked: false,
      lazyValue: this.value,
    }
  },
  computed: {
    internalValue: {
      get () {
        return this.lazyValue
      },
      set (val) {
        this.lazyValue = val
        this.checked = !this.checked
        this.$emit('click', val)
      },
    },
    computedWidth () {
      return this.width ? convertToUnit(this.width) : null
    },
  },
  watch: {
    value (val) {
      this.lazyValue = val
    },
  },
}
</script>
