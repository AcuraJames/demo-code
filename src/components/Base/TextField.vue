<template>
  <InputBase
    :is-dirty="!!internalValue"
    :has-error="hasError"
    :has-state-icon="hasStateIcon"
    :hide-details="hideDetails"
    :detail-text="errorText"
    :class="[
      'text-field',
      {
        'is-disabled': disabled,
        'is-readonly': readonly,
        'text-field--outlined': outlined,
        'text-field--squared': squared,
        'text-field--single-line': singleLine,
        'text-field--solo': solo,
        'text-field--colored': colored,
        'text-field--colored-faded': coloredFaded,
        'text-field--borderless': borderless,
        'text-field--focused': hasFocus,
        'text-field--text-dark': textDark,
        'text-field--background-dark': backgroundDark
      }
    ]"
  >
    <div class="text-field__controls">
      <div class="text-field__slot"
        :style="compHeight"
      >
        <label
          v-if="!solo"
          :for="inputId"
          :class="[
            'text-field__label',
            { 'text-field__label--active': isLabelActive }
          ]"
        >
          {{ label }}
        </label>
        <div
          v-if="$slots.prepend"
          class="text-field__prepend"
        >
          <slot name="prepend" />
        </div>
        <input
          ref="input"
          v-model="internalValue"
          :id="inputId"
          :type="type === 'number' ? 'text' : type"
          :name="name"
          :required="required"
          :readonly="readonly"
          :disabled="disabled"
          :minlength="minlength"
          :maxlength="maxlength"
          :autofocus="autofocus"
          :placeholder="compPlaceholder"
          :class="{ 'text-right' : type === 'number' || right }"
          :inputmode="inputmode"
          :pattern="pattern"
          :step="step"
          @input="input"
          @change="change"
          @keydown="onKeyDown"
          @focus="onFocus"
          @blur="onBlur"
        >
        <div
          v-if="$slots.append"
          class="text-field__append"
        >
          <slot name="append" />
        </div>
      </div>
      <div class="text-field__append-outer">
        <slot name="append-outer" />
        <div
          v-if="hasStateIcon"
          class="text-field__state-icon"
        >
          <Icon v-if="hasError" color="#808080">
            {{ icons.mdiCloseCircle }}
          </Icon>
          <Icon v-else color="#808080">
            {{ icons.mdiCheckCircle }}
          </Icon>
        </div>
      </div>
    </div>
  </InputBase>
</template>

<script>
import debounce from 'lodash.debounce'

import { mdiCloseCircle, mdiCheckCircle } from '@mdi/js'

import validatable from '@/mixins/validatable'

import {
  convertToUnit,
  formatNumber,
  unformat,
  setCursor,
  // event,
} from '../../util/helpers'

export default {
  name: 'TextField',
  inject: {
    form: {
      default: null,
    },
  },
  mixins: [validatable],
  props: {
    value: {
      type: [String, Number, Date],
      default: null,
    },
    lazy: {
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
    type: {
      type: String,
      default: 'text',
    },
    inputmode: {
      type: String,
      default: 'text',
    },
    formatStyle: {
      type: String,
      default: 'decimal',
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
    minlength: {
      type: String,
      default: null,
    },
    maxlength: {
      type: String,
      default: null,
    },
    height: {
      type: [String, Number],
      default: null,
    },
    right: {
      type: Boolean,
      default: false,
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: null,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    hideDetails: {
      type: Boolean,
      default: false,
    },
    stateIcon: {
      type: Boolean,
      default: false,
    },
    outlined: {
      type: Boolean,
      default: false,
    },
    squared: {
      type: Boolean,
      default: false,
    },
    singleLine: {
      type: Boolean,
      default: false,
    },
    solo: {
      type: Boolean,
      default: false,
    },
    colored: {
      type: Boolean,
      default: false,
    },
    coloredFaded: {
      type: Boolean,
      default: false,
    },
    borderless: {
      type: Boolean,
      default: false,
    },
    textDark: {
      type: Boolean,
      default: false,
    },
    backgroundDark: {
      type: Boolean,
      default: false,
    },
    debounce: {
      type: Number,
      default: 0,
    },
  },
  data () {
    return {
      blurWithoutUpdate: false,
      hasFocus: false,
      editMode: false,
      // TODO input registrator
      inputId: 'input' + Math.round(Math.random() * 100000),
      lazyValue: this.value,
      integerPattern: '[0-9]*',
      decimalPattern: '^[0-9]+[,.][0-9]+$',
      integerStep: '1',
      decimalStep: '0.01',
      icons: {
        mdiCloseCircle,
        mdiCheckCircle,
      },
    }
  },
  computed: {
    compPlaceholder () {
      // ignore placeholder on number
      return this.type === 'number'
        ? '' : this.placeholder
    },
    compHeight () {
      return this.height ? convertToUnit(this.height) : null
    },
    formatNumberOptions () {
      return {
        precision: this.inputmode === 'numeric' ? 0 : 2,
        thousand: this.editMode ? '' : ' ',
        decimal: ',',
        fixed: !this.editMode && this.formatStyle === 'currency',
        fallback: !this.editMode ? 0 : null,
      }
    },
    internalValue: {
      get () {
        return this.lazyValue
      },
      set (val) {
        let value = val || null
        if (this.type === 'number') {
          value = formatNumber(val, this.formatNumberOptions)
        }
        this.lazyValue = value
      },
    },
    isLabelActive () {
      return this.hasFocus || this.internalValue || this.placeholder
    },
    hasStateIcon () {
      return this.form && this.form.wasValidated && this.stateIcon
    },
    pattern () {
      if (this.type === 'number') {
        if (this.inputmode === 'decimal') {
          return this.decimalPattern
        } else {
          return this.integerPattern
        }
      }
      return null
    },
    step () {
      if (this.type === 'number') {
        if (this.inputmode === 'decimal') {
          return this.decimalStep
        } else {
          return this.integerStep
        }
      }
      return null
    },
  },
  watch: {
    value: {
      handler (val) {
        if (this.editMode) return
        this.internalValue = val
      },
      immediate: true,
    },
  },
  created () {
    if (this.debounce) {
      this.debounceInput = debounce(this.emitChange, this.debounce)
    }
    if (this.form) {
      this.form.register(this)
    }
  },
  mounted () {
    if (this.autofocus) {
      this.$refs.input.focus()
    }
  },
  beforeDestroy () {
    if (this.form) {
      this.form.unregister(this)
    }
  },
  methods: {
    onFocus (e) {
      // edit mode start on focus
      this.editMode = true
      this.hasFocus = true
      if (this.type === 'number') {
        this.internalValue = this.value
          ? formatNumber(this.internalValue, this.formatNumberOptions)
          : null
        setTimeout(() => {
          e.target.selectionStart = e.target.selectionEnd = e.target.value.length
        })
      }
    },
    onBlur () {
      this.hasFocus = false
      // stop edit mode and call emit
      this.editMode = false
      if (this.type === 'number') {
        this.internalValue = formatNumber(this.internalValue, this.formatNumberOptions)
      }
      // cancel debounced
      if (this.debounce) {
        this.debounceInput.cancel()
      }
      // on esc blur without update
      if (this.blurWithoutUpdate) {
        this.blurWithoutUpdate = false
        return
      }
      // immediate call changes
      if (this.internalValue !== this.value && !this.lazy) {
        this.emitChange()
      }
    },
    focus () {
      this.$refs.input.focus()
    },
    emitChange () {
      // on number type return internal value, without formatting
      const val = this.type === 'number'
        ? unformat(this.internalValue, this.formatNumberOptions.decimal)
        : this.internalValue
      this.$emit('input', val)
    },
    input (e) {
      if (this.type === 'number') {
        const el = e.target
        let positionFromEnd = el.value.length - el.selectionEnd
        // update input value with formatted data
        el.value = formatNumber(el.value, this.formatNumberOptions)
        positionFromEnd = el.value.length - positionFromEnd
        setCursor(el, positionFromEnd)
        // el.dispatchEvent(event('change'))

        this.hasError = e.target.validity.badInput
      }
      if (!this.lazy) {
        if (this.debounce) {
          this.debounceInput()
        } else {
          this.emitChange()
        }
      }
      this.checkField(e)
    },

    change () {
      if (this.lazy) {
        this.emitChange()
      }
    },

    onKeyDown (e) {
      if (this.debounce) {
        // on esc set value from store
        if (e.key === 'Esc' || e.key === 'Escape') {
          this.internalValue = this.value
          this.blurWithoutUpdate = true
          this.$refs.input.blur()
          e.preventDefault()
        } else if (e.key === 'Enter') {
          // on enter blur normally
          this.$refs.input.blur()
          e.preventDefault()
        }
      }
    },
  },
}
</script>
