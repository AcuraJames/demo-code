<template>
  <InputBase
    :is-dirty="!!internalValue"
    :has-error="hasError"
    :has-state-icon="hasStateIcon"
    :hide-details="hideDetails"
    :detail-text="errorText"
    :class="[
      'text-area',
      {
        'is-disabled': disabled,
        'is-readonly': readonly,
        'text-area--single-line': singleLine,
        'text-area--outlined': outlined,
        'text-area--squared': squared,
        'text-area--solo': solo,
        'text-area--focused': hasFocus,
        'text-area--transparent': transparent
      }
    ]"
  >
    <div class="text-area__controls">
      <div class="text-area__slot">
        <label
          v-if="!solo"
          :for="inputId"
          :class="[
            'text-area__label',
            { 'text-area__label--active': isLabelActive }
          ]"
        >
          {{ label }}
        </label>
        <div
          v-if="$slots.prepend"
          class="text-area__prepend"
        >
          <slot name="prepend" />
        </div>
        <textarea
          ref="textarea"
          v-model="internalValue"
          :id="inputId"
          :name="name"
          :required="required"
          :readonly="readonly"
          :disabled="disabled"
          :cols="cols"
          :rows="rows"
          :maxlength="maxlength"
          :minlength="minlength"
          :autofocus="autofocus"
          :placeholder="placeholder"
          @input="calculateHeight"
          @focus="onFocus"
          @blur="onBlur"
        ></textarea>
        <div
          v-if="$slots.append"
          class="text-area__append"
        >
          <slot name="append" />
        </div>
      </div>
      <div class="text-area__append-outer">
        <slot name="append-outer" />
        <div
          v-if="hasStateIcon"
          class="text-area__state-icon"
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

import focusable from '@/mixins/focusable'
import validatable from '@/mixins/validatable'

export default {
  name: 'TextArea',
  inject: {
    form: {
      default: null,
    },
  },
  mixins: [focusable, validatable],
  props: {
    autoGrow: {
      type: Boolean,
      default: false,
    },
    value: {
      type: [String, Number],
      default: null,
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
    cols: {
      type: String,
      default: null,
    },
    rows: {
      type: [String, Number],
      default: null,
    },
    minlength: {
      type: String,
      default: null,
    },
    maxlength: {
      type: String,
      default: null,
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
    solo: {
      type: Boolean,
      default: false,
    },
    singleLine: {
      type: Boolean,
      default: false,
    },
    transparent: {
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
      // TODO input registrator
      inputId: 'input' + Math.round(Math.random() * 100000),
      lazyValue: this.value,
      icons: {
        mdiCloseCircle,
        mdiCheckCircle,
      },
    }
  },
  computed: {
    internalValue: {
      get () {
        return this.lazyValue
      },
      set (val) {
        const value = val || null
        this.lazyValue = value
        if (this.debounce) {
          this.debounceInput()
        } else {
          this.$emit('input', value)
        }
      },
    },
    isLabelActive () {
      return this.hasFocus || this.internalValue || this.placeholder
    },
    hasStateIcon () {
      return this.form && this.form.wasValidated && this.stateIcon
    },
  },
  watch: {
    value (val) {
      this.lazyValue = val
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
    this.autoGrow && this.calculateHeight()
  },
  beforeDestroy () {
    if (this.form) {
      this.form.unregister(this)
    }
  },
  methods: {
    emitChange () {
      this.$emit('input', this.internalValue)
    },
    calculateHeight () {
      const textArea = this.$refs.textarea
      textArea.style.height = '0'

      const height = textArea.scrollHeight
      const minHeight = parseInt(this.rows, 10) * 24

      textArea.style.height = Math.max(minHeight, height) + 'px'
    },
  },
}
</script>
