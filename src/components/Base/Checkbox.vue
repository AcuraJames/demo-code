<template>
  <InputBase
    :is-dirty="!!internalValue"
    :has-error="hasError"
    :hide-details="hideDetails"
    :detail-text="errorText"
    :class="[
      'checkbox',
      {'checkbox--secondary': secondary},
      {'checkbox--vertical': verticalAlign},
      {'checkbox--horizontal': horizontalAlign},
    ]"
  >
    <div class="checkbox__slot">
      <div class="checkbox__input">
        <input
          ref="input"
          type="checkbox"
          v-model="internalValue"
          :id="inputId"
          :name="name"
          :required="required"
          :readonly="readonly"
          :disabled="disabled"
          @input="checkField"
        >
        <i class="checkbox__icon">
          <div class="icon__item">
            <svg v-if="checked" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><title>checkbox</title><path d="M7,3a4,4,0,1,0,4,4A4,4,0,0,0,7,3Zm0,7a3,3,0,1,1,3-3A3,3,0,0,1,7,10Z" style="fill:#5a8199"/><circle cx="7" cy="7" r="3" style="fill:#16a0ce"/><path d="M0,0V14H14V0H0ZM12,12H2V2H12V12Z" style="fill:currentColor"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><title>checkbox-empty</title><path d="M0,0V14H14V0H0ZM12,12H2V2H12V12Z" style="fill:currentColor"/></svg>
          </div>
        </i>
      </div>
      <label :for="inputId" class="cursor-pointer">
        <slot />
      </label>
    </div>
  </InputBase>
</template>

<script>
import validatable from '@/mixins/validatable'

export default {
  name: 'Checkbox',
  inject: {
    form: {
      default: null,
    },
  },
  mixins: [validatable],
  props: {
    value: {
      type: Boolean,
      default: false,
    },
    rules: {
      type: Array,
    },
    label: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: null,
    },
    required: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    hideDetails: {
      type: Boolean,
      default: false,
    },
    horizontalAlign: {
      type: Boolean,
      default: false,
    },
    verticalAlign: {
      type: Boolean,
      default: false,
    },
    secondary: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      checked: false,
      // TODO input registrator
      inputId: 'input' + Math.round(Math.random() * 100000),
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
        this.checked = !!val
        this.$emit('input', val)
      },
    },
  },
  watch: {
    value: {
      handler (val) {
        this.lazyValue = val
        this.checked = !!val
      },
      immediate: true,
    },
  },
  created () {
    if (this.form) {
      this.form.register(this)
    }
  },
  beforeDestroy () {
    if (this.form) {
      this.form.unregister(this)
    }
  },
}
</script>
