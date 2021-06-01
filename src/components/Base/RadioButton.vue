<template>
  <InputBase
    :is-dirty="!!internalValue"
    :has-error="hasError"
    :hide-details="hideDetails"
    :detail-text="errorText"
    :class="['radio', {'radio--center': center}]"
  >
    <div class="radio__slot">
      <div class="radio__input">
        <input
          ref="input"
          type="radio"
          v-model="internalValue"
          :value="label"
          :id="inputId"
          :name="name"
          :required="required"
          :readonly="readonly"
          :disabled="disabled"
        >
        <i class="radio__icon">
          <div class="icon__item">
            <svg v-if="checked" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><title>radio-checked</title><path d="M7,3a4,4,0,1,0,4,4A4,4,0,0,0,7,3Zm0,7a3,3,0,1,1,3-3A3,3,0,0,1,7,10Z" style="fill:#5a8199"/><circle cx="7" cy="7" r="3" style="fill:#16a0ce"/><path d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0ZM7,13a6,6,0,1,1,6-6A6,6,0,0,1,7,13Z" style="fill:#5a8199"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><title>radio</title><path d="M7,0a7,7,0,1,0,7,7A7,7,0,0,0,7,0ZM7,13a6,6,0,1,1,6-6A6,6,0,0,1,7,13Z" style="fill:#5a8199"/></svg>
          </div>
        </i>
      </div>
      <label :for="inputId">
        <slot />
      </label>
    </div>
  </InputBase>
</template>

<script>
import validatable from '@/mixins/validatable'

export default {
  name: 'RadioButton',
  mixins: [validatable],
  props: {
    value: [String, Number, Boolean],
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
    center: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
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
        this.$emit('input', val)
      },
    },
    checked () {
      return this.label === this.internalValue
    },
  },
  watch: {
    value (val) {
      this.lazyValue = val
    },
  },
}
</script>
