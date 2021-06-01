<template>
  <div
    :class="[
      'toggle',
      { 'toggle--small': small },
      { 'toggle--large': large },
    ]"
  >
    <input
      type="checkbox"
      v-model="internalValue"
    >
    <div class="toggle__icon">
      <div class="icon__item">
        <svg v-if="internalValue" xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8"><title>toggle-checked</title><circle cx="4" cy="4" r="4" style="fill:#5a8199"/><circle cx="4" cy="4" r="3" style="fill:#16a0ce"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8"><title>toggle</title><path d="M4,0A4,4,0,1,0,8,4,4,4,0,0,0,4,0ZM4,7A3,3,0,1,1,7,4,3,3,0,0,1,4,7Z" style="fill:#5a8199"/></svg>
      </div>
    </div>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'ToggleButton',
  props: {
    value: {
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
  },
  data () {
    return {
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
        this.$emit('input', val)
      },
    },
  },
  watch: {
    value (val) {
      this.lazyValue = val
    },
  },
}
</script>
