<template>
  <div>
    <div class="data-table-wrapper">
      <div>
        <div class="flex">
          <DataTable
            :headers="headers"
            :items="items"
            table-width="100%"
            table-class="table-fixed"
            thead-class="text-accent2"
          >
            <template v-slot:top>
              <div class="flex">
                <div
                  :style="{
                    width: fixedHeadersWidth + 'px',
                    background: 'linear-gradient(to top, #1c1c1c 50%, #1c1c1c 100%)'
                  }"
                ></div>
                <ul
                  class="tabs"
                  @click="switchTab"
                >
                  <li
                    v-for="tab in tabs"
                    :key="tab.value"
                    :value="tab.value"
                    :style="{ width: tab.width + 'px' }"
                    :class="['tab-item', {'tab-item--active': activeTab === tab.value}]"
                  >{{ tab.text }}</li>
                </ul>
              </div>
            </template>
            <template v-slot:items="{ items }">
              <Product
                v-for="(item, index) in items"
                :key="item.id"
                :item="item"
                :index="index"
                :profit-type="invoiceItem.profitType"
                :profit-for-all="invoiceItem.profitForAll"
                class="items base-accent3"
              />
            </template>

            <template v-slot:footer>
              <tr class="items base-accent3">
                <td colspan="3"></td>
                <td class="text-primary" colspan="2">
                  <div class="flex">
                    <Button
                      text
                      class="flex"
                      @click.prevent="createProduct"
                    >
                      <template v-slot:icon>
                        <Icon size="20">{{ icons.mdiPlusCircleOutline }}</Icon>
                      </template>
                      <span>{{ $t('shipping.addProduct') }}</span>
                    </Button>
                  </div>
                </td>

                <template v-if="activeTab === 1">
                  <td class="text-gray-light text-right">{{ $t('shipping.total') }}</td>
                  <td class="text-gray-dark text-right">
                    {{ $n(invoiceItem.totalPurchaseAmount || 0, 'formatted') }}
                  </td>
                  <td class="text-gray-dark text-right">{{ $t('shipping.total') }}</td>
                  <td class="text-gray-dark text-right">
                    {{ $n(invoiceItem.totalClientAmount || 0, 'formatted') }}
                  </td>
                  <td colspan="2"></td>
                </template>

                <template v-else-if="activeTab === 2">
                  <td class="text-gray-dark">{{ $t('shipping.total') }}</td>
                  <td class="text-gray-dark text-center">
                    {{ $n(invoiceItem.totalNet, 'formatted') }} <span class="text-gray-dark">{{ $t('measure.kg') }}</span>
                  </td>
                  <td class="text-gray-dark text-center">
                    {{ $n(invoiceItem.totalGross, 'formatted') }} <span class="text-gray-dark">{{ $t('measure.kg') }}</span>
                  </td>
                  <td class="text-gray-dark text-center">
                    {{ $n(invoiceItem.totalCapacity, 'formatted') }} <span class="text-gray-dark">{{ $t('measure.m') }}<sup>3</sup></span>
                  </td>
                  <td class="text-gray-dark text-center" colspan="3">
                    {{ $n(invoiceItem.totalPkgQty, 'formatted') }} <span class="text-gray-dark">{{ $t('measure.pkg') }}</span>
                  </td>
                  <td></td>
                </template>

                <template v-else>
                  <td colspan="4"></td>
                </template>

              </tr>
            </template>

          </DataTable>
        </div>
      </div>
    </div>
    <InvoiceFooter
      v-if="items && activeTab === 1"
      :item="invoiceItem"
    />
  </div>
</template>

<script>
import { mdiClose, mdiPlusCircleOutline } from '@mdi/js'

import {
  ProductStatus,
  InvoiceProfitType,
} from '@/graphql/enums'

import product from '../mixins/product'

import Product from '@/components/Product.vue'
import InvoiceFooter from '@/components/InvoiceFooter.vue'

export default {
  name: 'Invoice',
  components: {
    Product,
    InvoiceFooter,
  },
  mixins: [product],
  props: {
    invoice: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      ProductStatus,
      isBooted: false,
      createLoading: null,
      updateLoading: null,
      deleteLoading: null,
      activeTab: 1,
      errors: [],
      icons: {
        mdiClose,
        mdiPlusCircleOutline,
      },
    }
  },
  computed: {
    fixedHeadersWidth () {
      return this.productHeaders.reduce((acc, curr) => {
        return acc + (curr.width || 0)
      }, 0)
    },
    items () {
      return (this.invoice && this.invoice.products) || []
    },
    invoiceItem () {
      return this.invoice || {}
    },
    isInvoiceProfitTypeMargin () {
      return this.invoiceItem.profitType === InvoiceProfitType.MARGIN
    },
    isInvoiceProfitTypeCommission () {
      return this.invoiceItem.profitType === InvoiceProfitType.COMMISSION
    },
    tabs () {
      return [
        { value: 1, text: this.$t('shipping.prices'), width: 130 },
        { value: 2, text: this.$t('shipping.warehouse'), width: 130 },
        { value: 3, text: this.$t('shipping.description'), width: 130 },
        { value: 4, text: this.$t('shipping.link'), width: 130 },
      ]
    },
    headers () {
      switch (this.activeTab) {
        case 1: return [...this.productHeaders, ...this.costHeaders]
        case 2: return [...this.productHeaders, ...this.storeHeaders]
        case 3: return [...this.productHeaders, ...this.infoHeaders]
        case 4: return [...this.productHeaders, ...this.linkHeaders]
        default: return []
      }
    },
    productHeaders () {
      return [
        { text: '', value: 'status', align: 'left', width: 14 },
        { text: this.$t('shipping.productIndexNo'), value: 'index', align: 'left', width: 54 },
        { text: this.$t('shipping.photo'), value: 'photo', width: 55 },
        { text: this.$t('shipping.name'), value: 'name', width: 165 },
        { text: this.$t('shipping.model'), value: 'model', width: 165 },
        { text: this.$t('shipping.qty'), value: 'qty', width: 110 },
      ]
    },
    costHeaders () {
      return [
        {
          text: this.isInvoiceProfitTypeMargin
            ? this.$t('shipping.costPrice') : this.$t('shipping.purchaseCost'),
          value: 'purchasePrice',
          width: 138,
          bgcolor: 'gray-darkest',
        },
        { text: this.$t('shipping.obtainAmount'), value: 'purchaseAmount', minWidth: 100, bgcolor: 'gray-darkest' },
        { text: this.$t('shipping.clientCost'), value: 'clientPrice', width: 138, bgcolor: 'gray-darkest' },
        { text: this.$t('shipping.obtainAmount'), value: 'clientAmount', minWidth: 100, bgcolor: 'gray-darkest' },
        { text: '', value: 'action', width: 20, bgcolor: 'gray-darkest' },
      ]
    },
    storeHeaders () {
      return [
        { text: `${this.$t('shipping.net')}, ${this.$t('measure.kg')}`, value: 'net', width: 75, bgcolor: 'gray-darkest' },
        { text: `${this.$t('shipping.gross')}, ${this.$t('measure.kg')}`, value: 'gross', width: 80, bgcolor: 'gray-darkest' },
        { text: `${this.$t('shipping.packageSize')} (${this.$t('measure.mm')})`, value: 'size', width: 148, bgcolor: 'gray-darkest' },
        { text: this.$t('shipping.packageQty'), value: 'pkgQty', width: 65, bgcolor: 'gray-darkest' },
        { text: this.$t('shipping.packageNo'), value: 'pkgNo', width: 65, bgcolor: 'gray-darkest' },
        { text: this.$t('shipping.atWhouse'), value: 'atWhouse', minWidth: 75, bgcolor: 'gray-darkest' },
        { text: '', value: 'action', width: 20, bgcolor: 'gray-darkest' },
      ]
    },
    infoHeaders () {
      return [
        { text: this.$t('shipping.additionalPhoto'), value: 'images', width: 85, bgcolor: 'gray-darkest' },
        { text: this.$t('shipping.additionalInfo'), value: 'description', align: 'left', bgcolor: 'gray-darkest' },
        { text: '', value: 'action', width: 20, bgcolor: 'gray-darkest' },
      ]
    },
    linkHeaders () {
      return [
        { text: this.$t('shipping.linkField'), value: 'url', align: 'left', bgcolor: 'gray-darkest' },
        { text: this.$t('shipping.openLink'), value: 'openLink', width: 70, bgcolor: 'gray-darkest' },
        { text: '', value: 'action', width: 20, bgcolor: 'gray-darkest' },
      ]
    },
  },
}
</script>

<style lang="postcss" scoped>
/* table tabs */
.tabs {
  height: 26px;
  display: flex;
  color: #434343
}

.tab-item {
  @apply flex items-center justify-center;
  @apply rounded-t-lg text-sm cursor-pointer;
  bacground-color: #252525;
}
.tab-item:not(:first-child) {
  margin-left:  1px;
}
.tab-item--active {
  @apply bg-gray-darkest;
  color: #ababab
}
</style>
