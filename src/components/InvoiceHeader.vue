<template>
  <div class="invoice-header">
    <span
      :class="[
        'status-indicator mr-2 md:mr-6 flex-shrink-0',
        item.invoiceStatus === InvoiceStatus.IN_PRODUCTION
          ? 'status-indicator--orange' : item.invoiceStatus === InvoiceStatus.IN_STOCK
            ? 'status-indicator--green' : 'status-indicator--pink'
      ]"
    >
    </span>
    <slot />
    <div
      v-if="expanded"
      @click="$emit('click', item.id)"
      :class="[
        'invoice-header__expand',
        {'text-primary': iconColorPrimary}
      ]"
    >
      <template v-if="expanded.includes(item.id)">
        <span
          v-text="hasIconText ? $t('action.collapse') : ''"
          class="mr-2 hidden lg:inline"
        />
        <div class="invoice-header__expand__icon">
          <Icon :title="$t('action.collapse')">
            {{ icons.mdiMinus }}
          </Icon>
        </div>
      </template>
      <template v-else>
        <span
          v-text="hasIconText ? $t('action.expand') : ''"
          class="mr-2 hidden lg:inline"
        />
        <div class="invoice-header__expand__icon">
          <Icon :title="$t('action.expand')">
            {{ icons.mdiPlus }}
          </Icon>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { mdiMinus, mdiPlus } from '@mdi/js'
import { InvoiceStatus } from '@/graphql/enums'

export default {
  name: 'InvoiceHeader',
  props: {
    item: {
      type: [Array, Object],
      default: () => ({}),
    },
    expanded: {
      type: Array,
      default: () => ([]),
    },
    iconColorPrimary: {
      type: Boolean,
      default: false,
    },
    hasIconText: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      InvoiceStatus,
      icons: {
        mdiMinus,
        mdiPlus,
      },
    }
  },
}
</script>

<style lang="postcss">
.invoice-header {
  padding: 5px 10px;
  @apply relative flex items-center mx-auto w-full;
  @apply rounded-sm bg-accent1 text-right;
  color: #252525;
}
.light-theme .invoice-header {
  --base-accent1: #d6d6d6;
  color: #797979;
}

.invoice-header__expand {
  @apply ml-auto flex justify-end flex-grow;
  @apply text-sm cursor-pointer;
}
.invoice-header__expand__icon {
  @apply w-5 h-5;
  @apply flex justify-center items-center;
  @apply border-2;
}
</style>
