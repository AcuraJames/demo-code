<template>
  <div>

    <v-dialog
      v-model="leaveNote"
      max-width="443"
    >
      <PreviewMessageModal
        :heading="$t('preview.leaveNote')"
        :client="client"
        is-note
        @save="saveMessage"
        @close="leaveNote = false"
      />
    </v-dialog>

    <v-dialog
      v-model="leaveComment"
      max-width="443"
    >
      <PreviewMessageModal
        :heading="$t('preview.leaveComment')"
        :client="client"
        @save="saveMessage"
        @close="leaveComment= false"
      />
    </v-dialog>

    <div class="content view">
      <StatusBar />
      <div class="container container--sm">
        <div class="pt-10 md:pb-32">
          <div class="flex flex-col sm:flex-row justify-between">
            <span class="mb-3">
              <span>{{ $t('preview.shippingTitle') }}</span>&nbsp;
              <span>{{ spec.specNo }}</span>&nbsp;
              <span>{{ $t('preposition.from') }}:</span>&nbsp;
              <span>{{ $d($parseDate(spec.createdAt), 'short') }}</span>
            </span>
            <span
              class="mb-2 md:m-0 text-right text-primary text-sm cursor-pointer whitespace-no-wrap"
              @click="collapseAll"
            >{{ $t('action.collapseAll') }}</span>
          </div>

          <div v-for="(item) in items" :key="item.id" class="preview-invoice-wrapper">
            <InvoiceHeader
              :item="item"
              :expanded="expanded"
              icon-color-primary
              @click="expand"
            >
              <div class="flex flex-col md:flex-row pr-2 w-full md:w-auto text-left">
                <div>
                  <span>{{ item.invoiceNo }}</span>&nbsp;
                  <span class="text-sm">{{ $t('preposition.from') }}</span>&nbsp;
                  <span>{{ formatDate(item.purchaseDate) }}</span>&nbsp;
                </div>
                <span class="hidden md:block mx-1">//</span>&nbsp;
                <div>
                  <span class="text-sm">{{ $t('preview.expectedShipment').toLowerCase() }}</span>&nbsp;
                  <span>{{ formatDate(item.shippingDate) }}</span>
                </div>
              </div>
            </InvoiceHeader>
            <div v-if="expanded.includes(item.id)">
              <div class="data-table-wrapper">
                <DataTable
                  :headers="headers"
                  :items="item.products"
                  table-width="100%"
                  table-class="table-fixed"
                  thead-class="text-accent2"
                  headers-whitespace-normal
                >
                  <template v-slot:items="{ items }">
                    <tr
                      v-for="(item, index) in items"
                      :key="item.id"
                      class="items base-accent3 border-none"
                    >
                      <td class="text-gray-lighter text-right leading-none py-2 align-top">
                        {{ index + 1 }}
                      </td>
                      <td>
                        <ProductImage
                          :product-id="item.id"
                          :images="item.info.images"
                        />
                      </td>
                      <td>
                        <span>{{ item.name }}</span>
                        <p class="text-gray-light leading-none">{{ item.article }}</p>
                        <span class="flex items-center mt-2">
                          <img
                            v-if="item.productStatus === ProductStatus.IN_PRODUCTION"
                            src="../assets/icons/factory-yellow.png"
                            class="mb-2"
                          >
                          <img
                            v-else-if="item.productStatus === ProductStatus.IN_STOCK"
                            src="../assets/icons/in-stock.png"
                          >
                          <img
                            v-else
                            src="../assets/icons/in-processing.png"
                          >
                          <span class="ml-2 text-orange text-xs">
                            <span>
                              {{ item.productStatus ? $t(`status.${item.productStatus}`) : '' }}
                            </span>
                          </span>
                        </span>
                      </td>
                      <td class="text-center">
                        <div
                          v-if="item.info.images.length > 1"
                          class="flex justify-center items-center"
                        >
                          <span class="mr-1 text-sm text-gray-lightest">
                           + {{ item.info.images.length - 1 }}
                          </span>
                          <img src="@/assets/icons/pre-image.png">
                        </div>
                      </td>
                      <td class="text-right">{{ $n(item.cost.clientPrice) }}</td>
                      <td class="text-center">{{ item.qty }}</td>
                      <td class="text-right font-bold">{{ $n(item.cost.clientAmount) }}</td>
                      <td class="text-right">{{ item.store.pkgQty }}</td>
                      <td class="text-right">{{ item.store.pkgNo }}</td>
                      <td @click="leaveNote = true">
                        <div class="notes-count-wrapper">
                          <span v-if="notes.length > 0" class="notes-count-bubble">{{ notes.length }}</span>
                          <img src="@/assets/icons/message.png" class="mx-auto">
                        </div>
                      </td>
                    </tr>
                  </template>
                </DataTable>
              </div>
              <!-- / INVOICE FOOTER -->
              <div class="p-2 md:p-6 w-full flex justify-end bg-white">
                <div class="preview-footer md:mr-12 w-full md:w-1/2 flex">
                  <ul class="leaders w-2/3">
                    <li>
                      <span class="bg-white font-black text-right">{{ $t('preview.total') }} {{ $t('currency.CNY.symbol') }}</span>
                      <span class="bg-white font-bold">{{ $n(item.totalClientAmount) }}</span>
                    </li>
                    <li class="text-gray-lightest">
                      <span class="bg-white font-semibold">{{ $t('preview.discount') }} {{ $t('currency.CNY.symbol') }}</span>
                      <span class="bg-white font-bold">{{ $n(item.discount) }}</span>
                    </li>
                    <li>
                      <span class="bg-white font-semibold">{{ $t('preview.prepay') }}: {{ $t('currency.CNY.symbol') }}</span>
                      <span class="bg-white font-bold">{{ $n(item.prepayment) }}</span>
                    </li>
                    <li>
                      <span class="bg-white font-semibold">{{ $t('preview.residue') }}: {{ $t('currency.CNY.symbol') }}</span>
                      <span class="bg-white font-bold" style="color:#ff0000">{{ $n(item.obtainCost) }}</span>
                    </li>
                  </ul>
                  <ul class="ml-5 text-sm text-gray-light">
                    <li v-if="!item.discount" class="mt-1">({{ $t('preview.noDiscount') }})</li>
                    <br v-else>
                    <br>
                    <li class="mt-1">{{ formatDate(item.prepaymentDate )|| '--.--.--' }}</li>
                    <li class="mt-1">{{ formatDate(item.obtainCostDate) || '--.--.--' }}</li>
                  </ul>
                </div>
              </div>
              <!-- INVOICE FOOTER / -->
            </div>
          </div>

          <div class="preview-summary">
            <h4 class="text-lg mb-4">
              {{ $t('preview.summaryTitle') }}
            </h4>
            <div class="preview-summary__wrapper flex-col lg:flex-row">
              <div class="preview-summary__info">
                <div v-if="spec.containers" class="relative">
                  <div
                    v-if="spec.shipped"
                    class="spec-summary__container__image spec-summary__container__image--shipped w-full"
                    style="left: -20px; width: 350px; background-size: auto; z-index: 1;"
                  />
                    <div
                      v-if="spec.containers.length === 1"
                      class="spec-summary__container"
                    >
                      <div
                        class="spec-summary__container__image spec-summary__container__image--full"
                        :style="{
                          width: (spec.containers[0].loaded || 0) + '%',
                          height: '85px'
                        }"
                      />
                      <img width="210" height="85" src="/img/container-empty.svg" alt="">
                    </div>
                    <div v-else>
                      <div
                        v-for="(c, i) in loadedContainers"
                        :key="`loaded-${i}`"
                        class="spec-summary__container"
                      >
                        <div
                          class="spec-summary__container__image spec-summary__container__image--full-sm"
                          :style="{
                            width: '100%',
                            height: '48px'
                          }"
                        />
                        <div class="spec-summary__container__label">
                          {{ loadedContainers.length }} x {{ c.type }}′
                        </div>
                        <img width="210" height="48" src="/img/container-empty-sm.svg" alt="">
                      </div>
                      <div
                        v-for="(c, i) in unloadedContainers"
                        :key="`unloaded-${i}`"
                        class="spec-summary__container"
                      >
                        <div
                          class="spec-summary__container__image spec-summary__container__image--full-sm"
                          :style="{
                            width: (c.loaded || 0) + '%',
                            height: '48px'
                          }"
                        />
                        <img width="210" height="48" src="/img/container-empty-sm.svg" alt="">
                      </div>
                    </div>
                  </div>
                  <div>
                  <ul class="leaders">
                    <li
                      v-for="(c, i) in unloadedContainers"
                      :key="i"
                    >
                      <span>
                        <span class="leaders__num">
                          {{ c.type || '20' }}{{ $t('preview.containerMeasure') }}
                        </span>
                        {{ ` ${$t('preview.container')} ${$t('preview.containerLoaded')}` }}
                      </span>
                      <span class="leaders__num">
                        {{ c.loaded }}%
                      </span>
                    </li>
                    <li>
                      <span>{{ $t('preview.estimateDate') }}</span>
                      <span class="leaders__num">
                        {{ $d($parseDate(spec.estimateShippingDate), 'short') }}
                      </span>
                    </li>
                    <li>
                      <span>{{ $t('preview.totalVolume') }}</span>
                      <span class="leaders__num">
                        {{ $n(spec.totalVolume, 'formatted') }} {{ $t('measure.m') }}<sup>3</sup>
                      </span>
                    </li>
                    <li>
                      <span>{{ $t('preview.totalWeight') }}</span>
                      <span class="leaders__num">
                        {{ $n(spec.totalWeight, 'formatted') }} {{ $t('measure.kg') }}
                      </span>
                    </li>
                    <li>
                      <span>{{ $t('preview.qtyOfPackages') }}</span>
                      <span class="leaders__num">
                        {{ $n(spec.qtyOfPackages, 'formatted') }}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="preview-summary__cost">
                <div class="preview-summary__cost__card">
                  <ul class="leaders">
                    <li class="pb-2">
                      <span class="font-bold">
                        {{ $t('preview.costOfGood') }} {{ $t('currency.CNY.symbol') }}
                      </span>
                      <!-- TODO to custom component or Intl polyfill -->
                      <!-- i18n-n has Error formatter.formatToParts is not a function. -->
                      <span class="flex font-bold">
                        <div class="text-accent1">{{ $n(spec.finalCost, 'integer') }}</div>
                        <div style="padding-left: 1px; letter-spacing: -1px">{{ $n(spec.finalCost, 'decimal').slice(-3, -2) }}</div>
                        <div class="text-sm">{{ $n(spec.finalCost, 'decimal').slice(-2) }}</div>
                      </span>
                    </li>
                    <li class="pb-2">
                      <span>
                        {{ $t('preview.totalPrepay') }} {{ $t('currency.CNY.symbol') }}
                      </span>
                      <span class="flex ">
                        <div class="text-accent1">{{ $n(spec.totalPrepay, 'integer') }}</div>
                        <div style="padding-left: 1px; letter-spacing: -1px">{{ $n(spec.totalPrepay, 'decimal').slice(-3, -2) }}</div>
                        <div class="text-sm">{{ $n(spec.totalPrepay, 'decimal').slice(-2) }}</div>
                      </span>
                    </li>
                    <li class="pb-2">
                      <span>
                        {{ $t('preview.finalToPay') }}  {{ $t('currency.CNY.symbol') }}
                      </span>
                      <span class="flex font-bold" style="color: #ff0000;">
                        <div>{{ $n(spec.totalClientDebt, 'integer') }}</div>
                        <div style="padding-left: 1px; letter-spacing: -1px">{{ $n(spec.totalClientDebt, 'decimal').slice(-3, -2) }}</div>
                        <div class="text-sm">{{ $n(spec.totalClientDebt, 'decimal').slice(-2) }}</div>
                      </span>
                    </li>
                  </ul>
                  <div class="mt-8 text-sm text-right">
                    <v-menu
                      v-model="menuCurrency"
                      max-width="175"
                      nudge-right="195"
                      offset-y
                    >
                      <template v-slot:activator="{ on }">
                        <div class="w-full flex justify-end items-center" v-on="on">
                          <span style="padding-top:2px; padding-right:3px; font-style:italic">Валюта:</span>
                          <span class="flex items-center font-bold cursor-pointer">
                            Китайский Юань CNY ({{ $t('currency.CNY.symbol') }})
                            <Icon v-if="!menuCurrency">{{ icons.mdiChevronDown }}</Icon>
                            <Icon v-else>{{ icons.mdiChevronUp }}</Icon>
                          </span>
                        </div>
                      </template>
                      <template>
                        <ul role="menu" class="bg-white">
                          <li class="currency-picker__item">
                            <span>Dollar</span>
                          </li>
                          <li class="currency-picker__item">
                            <span>Bitcoin</span>
                          </li>
                          <li class="currency-picker__item">
                            <span>Rubl</span>
                          </li>
                        </ul>
                      </template>
                    </v-menu>
                  </div>
                </div>
              </div>
              <div class="preview-summary__actions">
                <div @click.prevent>
                  <img src="@/assets/icons/printer.png" class="mr-3">
                  <span class="text-left">{{ $t('preview.printThis') }}</span>
                </div>
                <div @click.prevent>
                  <img src="@/assets/icons/pdf.png" class="mr-3">
                  <span class="text-left">{{ $t('preview.downloadPDF') }}</span>
                </div>
                <div @click="leaveComment = true">
                  <img src="@/assets/icons/message.png" class="mr-3">
                  <span class="text-left">{{ $t('preview.comment') }}</span>
               </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Copyright />
    </div>
  </div>
</template>

<script>
import format from 'date-fns/format'

import {
  mdiChevronDown,
  mdiChevronUp,
  mdiMinus,
  mdiPlus,
} from '@mdi/js'

import {
  ziSettings,
  ziPaperPlane,
  ziPrint,
  ziShare,
} from '@/assets/icons'

import PreviewMessageModal from '@/components/PreviewMessageModal'

import StatusBar from '@/components/StatusBar'
import Copyright from '@/components/Copyright'
import InvoiceHeader from '../components/InvoiceHeader.vue'
import ProductImage from '../components/ProductImage.vue'

import { ProductStatus, InvoiceStatus } from '@/graphql/enums'
import { GET_SPEC } from '../graphql/queries'

export default {
  name: 'Preview',
  components: {
    PreviewMessageModal,
    StatusBar,
    Copyright,
    InvoiceHeader,
    ProductImage,
  },
  apollo: {
    getSpec: {
      query: GET_SPEC,
      variables () {
        return {
          id: this.specId,
        }
      },
    },
  },
  data () {
    return {
      leaveNote: false,
      notes: [],
      leaveComment: false,
      comments: [],
      containers: [
        { type: '20', loaded: 100 },
        { type: '20', loaded: 28 },
      ],
      expanded: [],
      icons: {
        mdiChevronDown,
        mdiChevronUp,
        mdiMinus,
        mdiPlus,
        ziSettings,
        ziPaperPlane,
        ziPrint,
        ziShare,
      },
      menuCurrency: false,
      ProductStatus,
      InvoiceStatus,
    }
  },
  computed: {
    headers () {
      return [
        { text: '#', value: 'number', align: 'right', width: 20 },
        { text: this.$t('preview.photo'), value: 'photo', align: 'left', width: 62 },
        { text: this.$t('preview.name'), value: 'name', align: 'left', width: 260 },
        { text: this.$t('preview.additionalImages'), value: 'images', align: 'left', width: 85 },
        { text: `${this.$t('preview.price')}(¥)`, value: 'price', width: 80 },
        { text: this.$t('preview.qty'), value: 'qty', width: 70 },
        { text: `${this.$t('preview.cost')}(¥)`, value: 'cost', align: 'left', width: 90 },
        { text: this.$t('preview.qtyOfPackages'), value: 'pkgQty', align: 'left', width: 62 },
        { text: this.$t('preview.packageNo'), value: 'pkgNo', align: 'left', width: 62 },
        { text: this.$t('preview.leaveNote'), value: 'note', align: 'left', width: 85 },
      ]
    },
    specId () {
      return this.$route.params.specId
    },
    spec () {
      return this.getSpec || {}
    },
    client () {
      const firstName = (this.getSpec && this.getSpec.client && this.getSpec.client.firstName) || {}
      const lastName = (this.getSpec && this.getSpec.client && this.getSpec.client.lastName) || {}
      return firstName + ' ' + lastName || {}
    },
    items () {
      return this.getSpec && this.getSpec.invoices
    },
    unloadedContainers () {
      return this.containers.filter(c => c.loaded !== 100)
    },
  },
  methods: {
    formatDate (date) {
      if (!date) return null
      const parsedDate = this.$parseDate(date)
      return format(parsedDate, this.$i18n.locale === 'zh'
        ? 'yyyy-M-d' : this.$i18n.locale === 'ru'
          ? 'dd.MM.yyyy' : 'dd/MM/yyyy',
      )
    },
    expand (id) {
      if (this.expanded.includes(id)) {
        const index = this.expanded.indexOf(id)
        this.expanded.splice(index, 1)
      } else {
        this.expanded.push(id)
      }
    },
    collapseAll () {
      this.expanded = []
    },
    saveMessage (message) {
      if (this.leaveNote) {
        this.notes.push(message)
        localStorage.setItem('notes', JSON.stringify(this.notes))
        this.leaveNote = false
      } else {
        this.comments.push(message)
        localStorage.setItem('comments', JSON.stringify(this.comments))
        this.leaveComment = false
      }
    },
  },
  created () {
    this.notes = JSON.parse(localStorage.getItem('notes')) || []
    this.comments = JSON.parse(localStorage.getItem('comments')) || []
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$el.classList.add('light-theme')
    })
  },
}
</script>

<style scoped lang="postcss">
.preview-invoice-wrapper {
  margin-bottom: 20px;
  -webkit-box-shadow: 0px 0px 42px -3px rgba(18,18,18,0.32);
  -moz-box-shadow: 0px 0px 42px -3px rgba(18,18,18,0.32);
  box-shadow: 0px 0px 42px -3px rgba(18,18,18,0.32);
}
.notes-count-wrapper {
  position: relative;
  width: 86px;
}
.notes-count-bubble {
  position: absolute;
  top: -7px;
  right: 23px;
  padding: 0 6px;
  font-size: 12px;
  color: #fff;
  background-color: tomato;
  border-radius: 50px;
}
.preview-summary {
  margin: 70px 0 50px;
  @apply bg-background;
}

.preview-summary__wrapper {
  @apply flex justify-between;
}

.preview-summary__info {
  max-width: 340px;
}

.preview-summary__cost {
  @apply flex-grow;
  max-width: 490px;
}
.preview-summary__cost__card {
  margin-top: 20px;
  padding: 60px 20px 20px;
  background-color: #272727;
  border-radius: 4px;
  font-size: 14px;
  background: linear-gradient(to top, #f4f4f4 70%, #e5e5e5 100%);
  @apply text-accent1;
}
@screen md {
  .preview-summary__cost__card {
    margin-top: 0;
    padding-left: 60px;
    padding-right: 60px;
    font-size: 18px;
  }
}

.preview-summary__actions {
  width: 100%;
  padding-top: 20px;
  padding-bottom: 20px;
}
.preview-summary__actions > div {
  @apply flex items-center text-primary cursor-pointer;
}
.preview-summary__actions > div:not(:last-child) {
  margin-bottom: 25px;
}
.preview-summary__actions div:hover {
  color: #6996B2;
}
@screen lg {
  .preview-summary__actions {
    width: 120px;
  }
}

.preview-summary__container {
  width: 210px;
  @apply mb-4 relative;
}
.preview-summary__container__image {
  @apply absolute inset-0 w-full h-full bg-cover bg-left bg-no-repeat;
}
.preview-summary__container__image--full {
  background-image: url("/img/container-full.png");
}
.preview-summary__container__image--full-sm {
  background-image: url("/img/container-full-sm.png");
}
.preview-summary__container__image--shipped {
  background-image: url("/img/container-shipped.png");
}

.preview-summary__info ul.leaders span:first-child,
.preview-summary__info ul.leaders span + span {
  @apply bg-background;
}
.preview-summary__cost ul.leaders span:first-child,
.preview-summary__cost ul.leaders span + span {
  background-color: #f4f4f4;
}

.preview-footer .leaders,
.preview-summary .leaders {
  line-height: 1.5rem;
  padding: 0;
  overflow-x: hidden;
  list-style: none}
.preview-footer .leaders li:after,
.preview-summary .leaders li:after {
  float: left;
  width: 0;
  white-space: nowrap;
  content:
 ". . . . . . . . . . . . . . . . . . . . "
 ". . . . . . . . . . . . . . . . . . . . "
 ". . . . . . . . . . . . . . . . . . . . "
 ". . . . . . . . . . . . . . . . . . . . "
 }
.preview-footer .leaders span:first-child,
.preview-summary .leaders span:first-child {
  padding-right: 0.33em;
}
.preview-footer .leaders span + span,
.preview-summary .leaders span + span {
  float: right;
  padding-left: 0.33em;
  position: relative;
  z-index: 1
}
.preview-summary .leaders__num {
  @apply text-black font-bold;
}
.preview-summary .currency-picker__item {
  @apply flex cursor-pointer py-1 px-2 outline-none;
}
.preview-summary .currency-picker__item:hover {
  @apply text-primary;
}
</style>
