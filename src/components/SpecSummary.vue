<template>
  <div class="spec-summary">

    <v-dialog
      v-model="paperList"
      max-width="443"
    >
      <PaperListModal
        :items="papers"
        @close="paperList = false"
        @openPaper="openContract"
        @createPaper="createContract"
      />
    </v-dialog>

    <v-dialog
      v-model="paperConfigurator"
      :fullscreen="$vuetify.breakpoint.xs || $vuetify.breakpoint.sm"
      content-class="dialog-full-height paper-configurator-dialog"
      max-width="906"
      scrollable
      persistent
    >
      <PaperConfiguratorModal
        :blank="blank"
        :create="create"
        @update="contractCreated"
        @close="paperConfigurator = false"
      />
    </v-dialog>

    <div>
      <h4 class="text-lg mb-4">
        {{ $t('shipping.summaryTitle') }}
      </h4>
      <div class="spec-summary__wrapper flex-col lg:flex-row">
        <div class="spec-summary__info">
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
                    {{ c.type || '20' }}{{ $t('shipping.containerMeasure') }}
                  </span>
                  {{ ` ${$t('shipping.container')} ${$t('shipping.containerLoaded')}` }}
                </span>
                <span class="leaders__num">
                  {{ c.loaded }}%
                </span>
              </li>
              <li>
                <span>{{ $t('shipping.estimateDate') }}</span>
                <span class="leaders__num">
                  {{ spec.estimateShippingDate ? $d($parseDate(spec.estimateShippingDate), 'short') : '-' }}
                </span>
              </li>
              <li>
                <span>{{ $t('shipping.totalVolume') }}</span>
                <span class="leaders__num">
                  {{ $n(spec.totalVolume, 'formatted') }} {{ $t('measure.m') }}<sup>3</sup>
                </span>
              </li>
              <li>
                <span>{{ $t('shipping.totalWeight') }}</span>
                <span class="leaders__num">
                  {{ $n(spec.totalWeight, 'formatted') }} {{ $t('measure.kg') }}
                </span>
              </li>
              <li>
                <span>{{ $t('shipping.qtyOfPackages') }}</span>
                <span class="leaders__num">
                  {{ $n(spec.qtyOfPackages, 'formatted') }}
                </span>
              </li>
            </ul>
            <ToggleButton
              :value="spec.shipped"
              class="my-6"
              @input="updateSpec({ shipped: $event })"
            >
              <span>{{ $t('shipping.setShipped') }}</span>
            </ToggleButton>
          </div>
        </div>
        <div class="spec-summary__cost">
          <div class="spec-summary__cost__card">
            <ul class="leaders">
              <li>
                <span>
                  {{ $t('shipping.finalCost') }} {{ $t('currency.CNY.symbol') }}
                </span>
                <!-- TODO to custom component or Intl polyfill -->
                <!-- i18n-n has Error formatter.formatToParts is not a function. -->
                <span class="flex">
                  <div class="text-white">{{ $n(spec.finalCost, 'integer') }}</div>
                  <div style="padding-left: 1px; letter-spacing: -1px">{{ $n(spec.finalCost, 'decimal').slice(-3, -2) }}</div>
                  <div class="text-sm">{{ $n(spec.finalCost, 'decimal').slice(-2) }}</div>
                </span>
                <!-- <i18n-n :value="spec.finalCost" format="decimal" class="flex">
                  <template v-slot:integer="slotProps">
                    <div class="text-white">{{ slotProps.integer }}</div>
                  </template>
                  <template v-slot:group="slotProps">
                    <div class="text-sm">{{ slotProps.group }}</div>
                  </template>
                  <template v-slot:fraction="slotProps">
                    <div class="text-sm">{{ slotProps.fraction }}</div>
                  </template>
                </i18n-n> -->
              </li>
              <li>
                <span>
                  {{ $t('shipping.finalObtainCost') }} {{ $t('currency.CNY.symbol') }}
                </span>
                <span class="flex">
                  <div class="text-white">{{ $n(spec.finalObtainCost, 'integer') }}</div>
                  <div style="padding-left: 1px; letter-spacing: -1px">{{ $n(spec.finalObtainCost, 'decimal').slice(-3, -2) }}</div>
                  <div class="text-sm">{{ $n(spec.finalObtainCost, 'decimal').slice(-2) }}</div>
                </span>
                <!-- <i18n-n :value="spec.finalObtainCost" format="decimal" class="flex">
                  <template v-slot:integer="slotProps">
                    <div class="text-white">{{ slotProps.integer }}</div>
                  </template>
                  <template v-slot:group="slotProps">
                    <div class="text-sm">{{ slotProps.group }}</div>
                  </template>
                  <template v-slot:fraction="slotProps">
                    <div class="text-sm">{{ slotProps.fraction }}</div>
                  </template>
                </i18n-n> -->
              </li>
              <li>
                <span>
                  {{ $t('shipping.profit') }}  {{ $t('currency.CNY.symbol') }}
                </span>
                <span class="flex">
                  <div style="color: #00ff16;">{{ $n(spec.profit, 'integer') }}</div>
                  <div style="padding-left: 1px; letter-spacing: -1px">{{ $n(spec.profit, 'decimal').slice(-3, -2) }}</div>
                  <div class="text-sm">{{ $n(spec.profit, 'decimal').slice(-2) }}</div>
                </span>
                <!-- <i18n-n :value="spec.profit" format="decimal" class="flex">
                  <template v-slot:integer="slotProps">
                    <div style="color: #00ff16;">{{ slotProps.integer }}</div>
                  </template>
                  <template v-slot:group="slotProps">
                    <div class="text-sm">{{ slotProps.group }}</div>
                  </template>
                  <template v-slot:fraction="slotProps">
                    <div class="text-sm">{{ slotProps.fraction }}</div>
                  </template>
                </i18n-n> -->
              </li>
            </ul>
          </div>
          <div class="spec-summary__cost__card" style="background-image: linear-gradient(to top, #272727 0%, #272727 80%, #1d1d1b 95%, #1d1d1b 100%);">
            <ul class="leaders">
              <li>
                <span>
                  {{ $t('shipping.totalPrepay') }} {{ $t('currency.CNY.symbol') }}
                </span>
                <span class="flex">
                  <div class="text-white">{{ $n(spec.totalPrepay, 'integer') }}</div>
                  <div style="padding-left: 1px; letter-spacing: -1px">{{ $n(spec.totalPrepay, 'decimal').slice(-3, -2) }}</div>
                  <div class="text-sm">{{ $n(spec.totalPrepay, 'decimal').slice(-2) }}</div>
                </span>
                <!-- <i18n-n :value="spec.totalPrepay" format="decimal" class="flex">
                  <template v-slot:integer="slotProps">
                    <div class="text-white">{{ slotProps.integer }}</div>
                  </template>
                  <template v-slot:group="slotProps">
                    <div class="text-sm">{{ slotProps.group }}</div>
                  </template>
                  <template v-slot:fraction="slotProps">
                    <div class="text-sm">{{ slotProps.fraction }}</div>
                  </template>
                </i18n-n> -->
              </li>
              <li>
                <span>
                  {{ $t('shipping.totalClientDebt') }} {{ $t('currency.CNY.symbol') }}
                </span>
                <span class="flex">
                  <div style="color: #ff2900;">{{ $n(spec.totalClientDebt, 'integer') }}</div>
                  <div style="padding-left: 1px; letter-spacing: -1px">{{ $n(spec.totalClientDebt, 'decimal').slice(-3, -2) }}</div>
                  <div class="text-sm">{{ $n(spec.totalClientDebt, 'decimal').slice(-2) }}</div>
                </span>
                <!-- <i18n-n :value="spec.totalClientDebt" format="decimal" class="flex">
                  <template v-slot:integer="slotProps">
                    <div style="color: #ff2900;">{{ slotProps.integer }}</div>
                  </template>
                  <template v-slot:group="slotProps">
                    <div class="text-sm">{{ slotProps.group }}</div>
                  </template>
                  <template v-slot:fraction="slotProps">
                    <div class="text-sm">{{ slotProps.fraction }}</div>
                  </template>
                </i18n-n> -->
              </li>
            </ul>
          </div>
          <div class="flex justify-end items-center pt-2 pr-4">
            <span>{{ $t('shipping.documentRate') }}</span>
            <span>&nbsp;=&nbsp;</span>
            <TextField
              :debounce="250"
              :placeholder="$t('placeholder.emptyNumber')"
              type="number"
              inputmode="decimal"
              solo
              colored
              outlined
              hide-details
              class="text-sm text-right w-16 mr-2 sm:p-0 leading-normal"
            />
          </div>
        </div>
        <div class="spec-summary__actions">
          <Button text class="mb-4" @click="openPaperList">
            <template v-slot:icon>
              <Icon size="32" color="#aaaaaa">
                {{ icons.ziSettings }}
              </Icon>
            </template>
            <span class="text-left">{{ $t('shipping.paperConfigurator') }}</span>
          </Button>
          <Button text class="mb-4" @click.prevent>
            <template v-slot:icon>
              <Icon size="32" color="#aaaaaa">
                {{ icons.ziPaperPlane }}
              </Icon>
            </template>
            <span class="text-left">{{ $t('shipping.notifyClient') }}</span>
          </Button>
          <Button text class="mb-4" @click="printPDF">
            <template v-slot:icon>
              <Icon size="32" color="#aaaaaa">
                {{ icons.ziPrint }}
              </Icon>
            </template>
            <span class="text-left">{{ $t('shipping.print') }}</span>
          </Button>
          <Button text @click.prevent>
            <template v-slot:icon>
              <Icon size="32" color="#aaaaaa">
                {{ icons.ziShare }}
              </Icon>
            </template>
            <span class="text-left">{{ $t('shipping.share') }}</span>
          </Button>
        </div>
      </div>
    </div>
    <div>
      <div style="max-width: 300px;">
        <Button
          large
          squared
          outline
          @click="$router.push({
            name: 'preview',
            params: {
              specId: $route.params.specId
            }
          })"
        >
          <span class="text-lg">{{ $t('shipping.overview') }}</span>
        </Button>
      </div>
      <div></div>
    </div>
  </div>
</template>

<script>
import cloneDeep from 'clone-deep'

import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'

import { UPDATE_SPEC } from '@/graphql/mutations'

import { ziSettings, ziPaperPlane, ziPrint, ziShare } from '@/assets/icons'

import PaperListModal from '@/components/PaperListModal.vue'
import PaperConfiguratorModal from '@/components/PaperConfiguratorModal.vue'

import { LIST_ORG_CONTRACTS } from '../graphql/queries'

export default {
  name: 'SpecSummary',
  components: {
    PaperListModal,
    PaperConfiguratorModal,
  },
  props: {
    spec: {
      type: Object,
      default: () => ({}),
    },
  },
  apollo: {
    listOrgContracts: {
      query: LIST_ORG_CONTRACTS,
      variables () {
        return {
          orgId: this.orgId,
        }
      },
      fetchPolicy: 'cache-and-network',
    },

  },
  data () {
    return {
      blank: {},
      papers: [],
      paperList: false,
      paperConfigurator: false,
      create: false,
      icons: {
        ziSettings,
        ziPaperPlane,
        ziPrint,
        ziShare,
      },
    }
  },
  computed: {
    // spec () {
    //   return {
    //     shipped: false,
    //     containers: [
    //       { type: '20', loaded: 100 },
    //       { type: '20', loaded: 28 },
    //     ],
    //     estimateShippingDate: '2019-09-23T17:28:48.880Z',
    //     totalVolume: 7.3,
    //     totalWeight: 799,
    //     qtyOfPackages: 27,
    //     finalCost: 260906.20,
    //     finalObtainCost: 101300,
    //     profit: 37759.37,
    //     totalPrepay: 101300,
    //     totalClientDebt: 159606.2,
    //     currencyRate: 9.256,
    //   }
    // },
    orgId () {
      return this.$route.params.orgId
    },
    containers () {
      return this.spec.containers || []
    },
    // TODO group by type and laoded
    loadedContainers () {
      return this.containers.filter(c => c.loaded === 100)
    },
    unloadedContainers () {
      return this.containers.filter(c => c.loaded !== 100)
    },
  },
  watch: {
    paperConfigurator (val) {
      if (!val) {
        setTimeout(() => {
          const dialog = document.querySelector('.paper-configurator-dialog .modal-body')
          if (dialog) dialog.scrollTop = 0
        }, 200)
      }
    },
  },
  methods: {
    printPDF () {
      pdfMake.vfs = pdfFonts.pdfMake.vfs
      const dd = {
        content: [
          {
            stack: [
              {
                text: [
                  { text: 'Спецификация No. ' },
                  { text: 'A0097-2020-02-02', bold: true },
                ],
              },
              'к Договору поставки',
            ],
            fontSize: 16,
            margin: [30, 20],
          },
          {
            columns: [
              { text: 'Новороссийск, Россия' },
              { text: '02 февраля 2020 г.', alignment: 'right' },
            ],
            alignment: 'justify',
            margin: [30, 10],
          },
          {
            text: [
              { text: '1.   ' },
              { text: 'Предмет поставки' },
            ],
            style: 'item-heading',
          },
          // TODO: dynamicly width of line equals width of table
          // {
          //   canvas: [
          //     {
          //       type: 'line',
          //       x1: 0,
          //       y1: 0,
          //       x2: 500,
          //       y2: 0,
          //       lineWidth: 1,
          //       lineColor: 'lightgray',
          //     },
          //   ],
          // },
          {
            table: {
              headerRows: 1,
              alignment: 'center',
              widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: '#', style: 'item-table-header' },
                  { text: 'Наименование товара', style: 'item-table-header' },
                  { text: 'Кол-во', style: 'item-table-header' },
                  { text: 'Ед.\n изм.', style: 'item-table-header' },
                  { text: 'Цена за ед.\n товара без НДС', style: 'item-table-header' },
                  { text: 'НДС за ед.\n (20%)', style: 'item-table-header' },
                  { text: 'Цена за ед.\n товара с НДС', style: 'item-table-header' },
                  { text: 'Стоимость товара\n с НДС', style: 'item-table-header' },
                ],
                [
                  { text: '1', fontSize: 10 },
                  {
                    text: [
                      { text: 'Chair\n', bold: true },
                      { text: 'PL-G0988-G0988-G0988 kfjgfd dfjgksdfjg' },
                    ],
                    fontSize: 10,
                  },
                  { text: '1 500', style: 'item-table' },
                  { text: 'pc', fontSize: 10 },
                  { text: '440,00', style: 'item-table' },
                  { text: '88,00', style: 'item-table' },
                  { text: '528,00', style: 'item-table' },
                  { text: '792 000,00 P', style: 'item-table' },
                ],
                [
                  { text: '2', fontSize: 10 },
                  {
                    text: [
                      { text: 'Chair\n', bold: true },
                      { text: 'PL-G0988' },
                    ],
                    fontSize: 10,
                  },
                  { text: '1 500', style: 'item-table' },
                  { text: 'pc', fontSize: 10 },
                  { text: '440,00', style: 'item-table' },
                  { text: '88,00', style: 'item-table' },
                  { text: '528,00', style: 'item-table' },
                  { text: '792 000,00 P', style: 'item-table' },
                ],
                [
                  { text: '3', fontSize: 10 },
                  {
                    text: [
                      { text: 'Chair\n', bold: true },
                      { text: 'PL-G0988' },
                    ],
                    fontSize: 10,
                  },
                  { text: '1 500', style: 'item-table' },
                  { text: 'pc', fontSize: 10 },
                  { text: '440,00', style: 'item-table' },
                  { text: '88,00', style: 'item-table' },
                  { text: '528,00', style: 'item-table' },
                  { text: '792 000,00 P', style: 'item-table' },
                ],
                [
                  { text: '', colSpan: 5 },
                  {}, {}, {}, {},
                  { text: 'Total:', style: 'item-table', bold: true },
                  { text: '2 620 446, 00 P', colSpan: 2, style: 'item-table', bold: true },
                ],
              ],
            },
            layout: 'lightHorizontalLines',
          },
          {
            text: 'Сумма прописью: два миллиона шестьсот двадцать тысяч четыреста сорок шесть рублей 00 копеек.',
            italics: true,
            fontSize: 10,
            alignment: 'right',
            margin: [0, 15],
          },
          {
            text: [
              { text: '2.   ' },
              { text: 'Условия оплат' },
            ],
            style: 'item-heading',
          },
          {
            style: 'item-paragraph',
            columns: [
              '2.1.',
              {
                text: 'Cтоимость железнодорожного тарифв, а также иные расходы, связанные с доставкой «Товара» Покупателю включены в цену «Товара».',
                width: 'auto',
              },
            ],
          },
          {
            style: 'item-paragraph',
            columns: [
              '2.2.',
              {
                text: 'Lorem ipsum dolor amet mustache knausgaard +1, blue bottle waistcoat tbh semiotics artisan synth stumptown gastropub cornhole celiac swag. Brunch raclette vexillologist post-ironic glossier ennui XOXO mlkshk godard pour-over blog tumblr humblebrag. Blue bottle put a bird on it twee prism biodiesel brooklyn. Blue bottle ennui tbh succulents.',
                width: 'auto',
              },
            ],
          },
          {
            text: [
              { text: '3.   ' },
              { text: 'Реквизиты сторон' },
            ],
            style: 'item-heading',
          },
          {
            columns: [
              {
                type: 'none',
                ul: [
                  {
                    columns: [
                      {
                        text: 'Supplier:',
                        style: 'requisite-columns',
                      },
                      {
                        text: 'Novaday Union Limeted',
                        style: 'requisite-columns',
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Legal Address:',
                        style: 'requisite-columns',
                      },
                      {
                        text: 'Unit 1010, 10/F Miramax Tower, 132 Nathan Road, Tsim Sha Tsul, Kowloon, Hong Hong',
                        style: 'requisite-columns',
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Postcode:',
                        style: 'requisite-columns',
                      },
                      {
                        text: '_____',
                        style: 'requisite-columns',
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Phone:',
                        style: 'requisite-columns',
                      },
                      {
                        text: '0086 186 20 00 0 00',
                        style: 'requisite-columns',
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Supplier\'s Bank:',
                        style: 'requisite-columns',
                      },
                      {
                        text: 'HSBC',
                        style: 'requisite-columns',
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Bank Address:',
                        style: 'requisite-columns',
                      },
                      {
                        text: '4/F HSBC, Tsim Sha Tsui Branch, 82-84 Nathan Road, Kowloon, Hong Hong',
                        style: 'requisite-columns',
                      },
                    ],
                  },
                ],
              },
              {
                type: 'none',
                ul: [
                  {
                    columns: [
                      {
                        text: 'Client:',
                        style: 'requisite-columns',
                      },
                      {
                        text: 'Horns & Hooves LLC, Newrussian office',
                        style: 'requisite-columns',
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Legal Address:',
                        style: 'requisite-columns',
                      },
                      {
                        text: 'Upperdock st. 41, office 15, Vladivostok, Russia',
                        style: 'requisite-columns',
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Postcode:',
                        style: 'requisite-columns',
                      },
                      {
                        text: '690000',
                        style: 'requisite-columns',
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Mailing Address:',
                        style: 'requisite-columns',
                      },
                      {
                        text: 'Moscow city, Minskaya st. 1G, office 777',
                        style: 'requisite-columns',
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Client\'s Bank:',
                        style: 'requisite-columns',
                      },
                      {
                        text: 'Clients Bank LLC',
                        style: 'requisite-columns',
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Bank Address:',
                        style: 'requisite-columns',
                      },
                      {
                        text: 'Moscow',
                        style: 'requisite-columns',
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Грузополучатель:',
                        style: 'requisite-columns',
                      },
                      {
                        text: 'ООО «Пупа и Лупа»',
                        style: 'requisite-columns',
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Адрес доставки:',
                        style: 'requisite-columns',
                        pageBreak: 'before',
                      },
                      {
                        text: '628380, Ханты-Мансийский Автономный округ - Югра, г. Пыть-Ях, Центральная промышленная зона',
                        style: 'requisite-columns',
                        pageBreak: 'before',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        styles: {
          'item-table-header': {
            fontSize: 9,
            alignment: 'center',
            margin: [0, 2],
          },
          'item-table': {
            fontSize: 10,
            alignment: 'right',
          },
          'item-heading': {
            bold: true,
            fontSize: 16,
            margin: [0, 20, 0, 10],
          },
          'item-paragraph': {
            columnGap: 10,
            margin: [0, 0, 0, 10],
          },
          'requisite-columns': {
            fontSize: 10,
            margin: [0, 2],
          },
        },
      }
      pdfMake.createPdf(dd).open()
    },
    async updateSpec (input) {
      try {
        this.updateLoading = true
        await this.$apollo.mutate({
          mutation: UPDATE_SPEC,
          variables: {
            id: this.spec.id,
            input,
          },
        })
      } catch (error) {
        throw new Error(error)
      } finally {
        this.updateLoading = false
      }
    },
    openPaperList () {
      this.papers = this.listOrgContracts
      this.paperList = true
    },
    openContract (id) {
      if (id) {
        this.create = false
        this.blank = cloneDeep(this.papers.find(paper => paper.id === id))
      }
      this.paperList = false
      this.paperConfigurator = true
    },
    createContract () {
      this.blank = {
        name: '',
        title: '',
        country: '',
        docHeader: '',
        useDefaultDocHeader: false,
        requisiteId: '',
        items: [{
          title: '',
          paragraphs: [],
        }],
        specItems: [{
          title: '',
          paragraphs: [],
        }],
      }
      this.create = true
      this.paperList = false
      this.paperConfigurator = true
    },
    contractCreated () {
      this.$apollo.queries.listOrgContracts.refetch()
    },
  },
}
</script>

<style lang="postcss" scoped>
.spec-summary {
  padding: 50px 0 50px;
}

.spec-summary__wrapper {
  @apply flex justify-between;
}

.spec-summary__info {
  max-width: 340px;
}

.spec-summary__cost {
  @apply flex-grow;
  max-width: 490px;
}
.spec-summary__cost__card {
  padding: 40px 60px;
  background-color: #272727;
  border-radius: 4px;
  font-size: 18px;
}

.spec-summary__actions {
  width: 100%;
  padding-top: 20px;
  padding-bottom: 20px;
}
.spec-summary__actions > button {
  display: flex;
}
.spec-summary__actions > button:not(:last-child) {
  margin-bottom: 25px;
}

@screen lg {
  .spec-summary__actions {
    width: 120px;
  }
}
.spec-summary__container {
  width: 210px;
  @apply mb-4 relative;
}
.spec-summary__container__label {
  @apply absolute inset-0 w-full h-full font-bold text-2xl text-white;
  @apply flex items-center justify-center;
}
/* TODO image import on component */
.spec-summary__container__image {
  @apply absolute inset-0 w-full h-full bg-cover bg-left bg-no-repeat;
}
.spec-summary__container__image--full {
  background-image: url("/img/container-full.png");
}
.spec-summary__container__image--full-sm {
  background-image: url("/img/container-full-sm.png");
}
.spec-summary__container__image--shipped {
  background-image: url("/img/container-shipped.png");
}

.spec-summary__info ul.leaders span:first-child,
.spec-summary__info ul.leaders span + span {
  @apply bg-chaos-black;
}
@screen md {
  .spec-summary__info ul.leaders span:first-child,
  .spec-summary__info ul.leaders span + span {
    background: #1e1e1e;
  }
}
.spec-summary__cost ul.leaders span:first-child,
.spec-summary__cost ul.leaders span + span {
  background-color: #272727;
}

.spec-summary .leaders {
  line-height: 1.5rem;
  padding: 0;
  overflow-x: hidden;
  list-style: none}
.spec-summary .leaders li:after {
  float: left;
  width: 0;
  white-space: nowrap;
  content:
 ". . . . . . . . . . . . . . . . . . . . "
 ". . . . . . . . . . . . . . . . . . . . "
 ". . . . . . . . . . . . . . . . . . . . "
 ". . . . . . . . . . . . . . . . . . . . "}
.spec-summary .leaders span:first-child {
  padding-right: 0.33em;}
.spec-summary .leaders span + span {
  float: right;
  padding-left: 0.33em;
  position: relative;
  z-index: 1
}
.spec-summary .leaders__num {
  @apply text-white font-bold
}
</style>
