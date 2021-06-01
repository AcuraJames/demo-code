<template>
  <div
    :class="[
      'data-table'
    ]"
  >
    <slot name="top"/>
    <table
      :width="tableWidth || null"
      class="tableClass"
    >
      <thead
        v-if="!hideHeaders"
        :class="theadClass"
      >
        <tr>
          <template
            v-for="(header, index) in headers"
            :class="tdHeadClass"
          >
            <slot
              :name="`header.${header.value}`"
              :value="header.value"
              :header="header"
            >
              <td
                :key="index"
                :width="convertToUnit(header.width) || null"
                :style="{
                  width: convertToUnit(header.width) || null,
                  minWidth: convertToUnit(header.minWidth) || null
                }"
                :class="[
                  headersWhitespaceNormal
                    ? 'whitespace-normal'
                    : 'whitespace-no-wrap',
                  `text-${header.align || 'center'}`,
                  `bg-${header.bgcolor || 'gradient'}`,
                  { 'sortable cursor-pointer': header.sortable },
                  header.sortable && internalOptions.sortBy.includes(header.value)
                    ? `active ${internalOptions.sortDesc[internalOptions.sortBy.findIndex(k => k === header.value)] ? 'desc' : 'asc'}`
                    : '',
                ]"
                @click="header.sortable ? sort(header.value) : {}"
              >
               <slot
                :name="`header.${header.value}-content`"
                :value="header.value"
                :header="header"
               >
                <span class="mr-1">{{ header.text }}</span>
               </slot>
                <span
                  v-if="header.sortable"
                  class="data-table-header__icon"
                >
                  <svg width="12" height="13" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:avocode="https://avocode.com/" viewBox="0 0 12 13"><defs></defs><g><g><title>Sort</title><path d="M11.0991,7.0508c-0.443,-0.391 -1.159,-0.391 -1.603,0l-2.599,2.293v0v-7.586c0,-0.552 -0.507,-1 -1.134,-1c-0.627,0 -1.134,0.448 -1.134,1v7.586v0l-2.599,-2.293c-0.444,-0.391 -1.16,-0.391 -1.603,0c-0.443,0.391 -0.443,1.023 0,1.414l5.336,4.707v0l5.336,-4.707c0.443,-0.391 0.443,-1.023 0,-1.414z" fill="currentColor" fill-opacity="1"></path></g></g></svg>
                </span>
              </td>
            </slot>
          </template>
        </tr>
      </thead>
      <tbody>
        <slot name="items" :items="computedItems">
          <tr v-if="computedItems.length === 0" :class="itemsRowClass">
            <td
              :colspan="headers.length"
              :class="itemsCellClass"
              class="text-center"
            >
              <span v-if="items.length === 0">
                {{ $t('dataTable.noData') }}
              </span>
              <span v-else>
                {{ $t('dataTable.noResult') }}
              </span>
            </td>
          </tr>
          <tr
            v-else
            v-for="(item, index) in items"
            :key="index"
            :class="['items base-accent3', itemsRowClass]"
          >
            <template v-for="header in headers">
              <slot
                :name="`item.${header.value}`"
                :value="item[header.value]"
                :item="item"
              >
                <td
                  :key="`${index}-${header.value}`"
                  :class="[`text-${header.align || 'center'}`, itemsCellClass]"
                >
                  {{ item[header.value] }}
                </td>
              </slot>

            </template>
          </tr>
        </slot>
        <slot name="expanded" />
        <slot name="footer" />
      </tbody>
    </table>
  </div>
</template>

<script>

import { convertToUnit, getObjectValueByPath, defaultFilter, sortItems, deepEqual } from '@/util/helpers'

function filterFn (item, search, filter) {
  return (header) => {
    const value = getObjectValueByPath(item, header.value)
    return header.filter ? header.filter(value, search, item) : filter(value, search, item)
  }
}

function searchTableItems (
  items,
  search,
  headersWithCustomFilters,
  headersWithoutCustomFilters,
  customFilter,
) {
  let filtered = items
  search = typeof search === 'string' ? search.trim() : null
  if (search && headersWithoutCustomFilters.length) {
    filtered = items.filter(item => headersWithoutCustomFilters.some(filterFn(item, search, customFilter)))
  }
  if (headersWithCustomFilters.length) {
    filtered = filtered.filter(item => headersWithCustomFilters.every(filterFn(item, search, defaultFilter)))
  }
  return filtered
}

export default {
  name: 'DataTable',
  props: {
    hideHeaders: {
      type: Boolean,
      default: false,
    },
    itemsRowClass: {
      type: String,
      default: null,
    },
    itemsCellClass: {
      type: String,
      default: null,
    },
    tableWidth: {
      type: [String, Number],
      default: '',
    },
    headersWhitespaceNormal: {
      type: Boolean,
      default: false,
    },
    headers: {
      type: Array,
      default: () => ([]),
    },
    items: {
      type: Array,
      default: () => ([]),
    },
    light: {
      type: Boolean,
      default: false,
    },
    expanded: {
      type: Array,
      default: () => ([]),
    },
    expand: {
      type: Boolean,
      default: false,
    },
    tableClass: {
      type: [String, Array, Object],
      default: '',
    },
    theadClass: {
      type: [String, Array, Object],
      default: '',
    },
    tdClass: {
      type: [String, Array, Object],
      default: '',
    },
    search: {
      type: String,
      default: '',
    },
    customFilter: {
      type: Function,
      default: defaultFilter,
    },
    page: {
      type: Number,
      default: 1,
    },
    itemsPerPage: {
      type: Number,
      default: 10,
    },
    options: {
      type: Object,
      default: () => ({
        page: 1,
        itemsPerPage: 10,
        sortBy: [],
        sortDesc: [],
        groupBy: [],
        groupDesc: [],
        multiSort: false,
        mustSort: false,
      }),
    },
  },
  data () {
    return {
      serverItemsLength: -1,
      internalOptions: {
        page: this.page,
        itemsPerPage: this.itemsPerPage,
        sortBy: this.options.sortBy,
        sortDesc: this.options.sortDesc,
        groupBy: this.options.groupBy,
        groupDesc: this.options.groupDesc,
        mustSort: this.options.mustSort,
        multiSort: this.options.multiSort,
      },
    }
  },
  computed: {
    locale () {
      return this.$i18n.locale
    },
    itemsLength () {
      return this.serverItemsLength >= 0 ? this.serverItemsLength : this.filteredItems.length
    },
    pageCount () {
      return this.internalOptions.itemsPerPage === -1
        ? 1
        : Math.ceil(this.itemsLength / this.internalOptions.itemsPerPage) // TODO: can't use items.length here
    },
    computedHeaders () {
      if (!this.headers) return []
      const headers = this.headers
      return headers
    },
    columnSorters () {
      return this.computedHeaders.reduce((acc, header) => {
        if (header.sort) acc[header.value] = header.sort
        return acc
      }, {})
    },
    headersWithCustomFilters () {
      return this.computedHeaders.filter(header => header.filter)
    },
    headersWithoutCustomFilters () {
      return this.computedHeaders.filter(header => !header.filter)
    },
    filteredItems () {
      let items = this.items.slice()
      if (!this.disableFiltering && this.serverItemsLength <= 0) {
        items = this.customFilterWithColumns(items, this.search)
      }
      return items
    },
    computedItems () {
      let items = this.filteredItems.slice()
      if (!this.disableSort && this.serverItemsLength <= 0) {
        items = this.sortItems(items)
      }
      return items
    },
  },
  methods: {
    convertToUnit (val) {
      return convertToUnit(val)
    },
    toggle (key, oldBy, oldDesc, page, mustSort, multiSort) {
      let by = oldBy.slice()
      let desc = oldDesc.slice()
      const byIndex = by.findIndex((k) => k === key)

      if (byIndex < 0) {
        if (!multiSort) {
          by = []
          desc = []
        }

        by.push(key)
        desc.push(false)
      } else if (byIndex >= 0 && !desc[byIndex]) {
        desc[byIndex] = true
      } else if (!mustSort) {
        by.splice(byIndex, 1)
        desc.splice(byIndex, 1)
      } else {
        desc[byIndex] = false
      }

      // Reset page to 1 if sortBy or sortDesc have changed
      if (!deepEqual(by, oldBy) || !deepEqual(desc, oldDesc)) {
        page = 1
      }

      return { by, desc, page }
    },
    sort (key) {
      if (Array.isArray(key)) return this.sortArray(key)

      const { by: sortBy, desc: sortDesc, page } = this.toggle(
        key,
        this.internalOptions.sortBy,
        this.internalOptions.sortDesc,
        this.internalOptions.page,
        this.mustSort,
        this.multiSort,
      )
      this.updateOptions({ sortBy, sortDesc, page })
    },
    sortArray (sortBy) {
      const sortDesc = sortBy.map(s => {
        const i = this.internalOptions.sortBy.findIndex((k) => k === s)
        return i > -1 ? this.internalOptions.sortDesc[i] : false
      })

      this.updateOptions({ sortBy, sortDesc })
    },
    updateOptions (options) {
      this.internalOptions = {
        ...this.internalOptions,
        ...options,
        page: this.serverItemsLength < 0
          ? Math.max(1, Math.min(options.page || this.internalOptions.page, this.pageCount))
          : options.page || this.internalOptions.page,
      }
    },
    sortItems (items) {
      const sortBy = this.internalOptions.groupBy.concat(this.internalOptions.sortBy)
      const sortDesc = this.internalOptions.groupDesc.concat(this.internalOptions.sortDesc)
      return this.customSortWithHeaders(items, sortBy, sortDesc, this.locale)
    },
    customSortWithHeaders (items, sortBy, sortDesc, locale) {
      return sortItems(items, sortBy, sortDesc, locale, this.columnSorters)
    },
    customFilterWithColumns (items, search) {
      return searchTableItems(items, search, this.headersWithCustomFilters, this.headersWithoutCustomFilters, this.customFilter)
    },
  },
}
</script>
