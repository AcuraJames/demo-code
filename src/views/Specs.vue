<template>
  <div class="container container--sm">
    <div class="py-10">
      <div v-if="loading">{{ `${$t('action.loading')}...` }}</div>

      <div class="pt-5 pb-6">
        <TextField
          v-model="search"
          :placeholder="$t('placeholder.pageSearch')"
          solo
          outlined
          background-dark
          hide-details
          class="max-w-2xl text-2xl leading-normal mx-auto"
        >
          <template v-slot:append>
            <Icon size="24">{{ icons.mdiMagnify }}</Icon>
          </template>
        </TextField>
      </div>

      <div class="overflow-x-auto">
        <DataTable
          :headers="headers"
          :items="items"
          :search="search"
          table-width="100%"
          table-class="table-fixed"
          thead-class="text-accent2 border-b border-accent2"
        >
          <template v-slot:header.status="{ header }">
            <td
              :width="header.width + 'px'"
              class="px-3"
            >
              <svg width="10" height="10" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:avocode="https://avocode.com/" viewBox="0 0 10 10"><defs><clipPath id="ClipPath1016"><path d="M5.00003,0c2.76138,0 4.99994,2.23864 4.99994,5.00005c0,2.76141 -2.23856,4.99997 -4.99994,4.99997c-2.76152,0 -5.00007,-2.23855 -5.00007,-4.99997c0,-2.76141 2.23856,-5.00005 5.00007,-5.00005z" fill="currentColor"></path></clipPath></defs><g><g><title>Status</title><path d="M5.00003,0c2.76138,0 4.99994,2.23864 4.99994,5.00005c0,2.76141 -2.23856,4.99997 -4.99994,4.99997c-2.76152,0 -5.00007,-2.23855 -5.00007,-4.99997c0,-2.76141 2.23856,-5.00005 5.00007,-5.00005z" fill-opacity="0" fill="currentColor" stroke-dashoffset="0" stroke-dasharray="" stroke-linejoin="miter" stroke-linecap="butt" stroke-opacity="1" stroke="#414141" stroke-miterlimit="50" stroke-width="2" clip-path="url(&quot;#ClipPath1016&quot;)"></path></g></g></svg>
            </td>
          </template>
          <template v-slot:header.coming="{ header }">
            <td :width="header.width + 'px'">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <span v-on="on">
                    +$
                  </span>
                </template>
                <span>
                  {{ $t('deals.moneyRecieved') }}
                </span>
              </v-tooltip>
            </td>
          </template>
          <template v-slot:header.spending="{ header }">
            <td :width="header.width + 'px'">
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <span v-on="on">-$</span>
                </template>
                <span>
                  {{ $t('deals.expensesPaid') }}
                </span>
              </v-tooltip>
            </td>
          </template>
          <template v-slot:items="{ items }">
            <tr
              v-for="(item) in items"
              :key="item.id"
              class="items bg-background hover:bg-accent3 border-none"
              @click="$router.push({
                name: 'spec',
                params: {
                  specId: item.id
                }
              })"
            >
              <td class="relative px-3">
                <span
                  :class="[
                    'status-indicator inline-block',
                    item.specStatus === SpecStatus.IN_PRODUCTION
                      ? 'status-indicator--orange' : item.specStatus === SpecStatus.IN_STOCK
                        ? 'status-indicator--green' : 'status-indicator--pink'
                  ]"
                >
                </span>
              </td>
              <td></td>
              <td></td>
              <td>{{ (item.client && item.client.uid) || '-' }}</td>
              <td>{{ getClientName(item.client) }}</td>
              <td>{{ ((item.client && item.client.phone) || (item.client && item.client.mobilePhone)) || '-' }}</td>
              <td>{{ item.customNumber || item.specNo || '-' }}</td>
              <td class="text-center">
                {{ $d($parseDate(item.createdAt), 'short') }}
              </td>
              <td class="text-center pointer-events-none" @click.prevent.stop>
                <div
                  class="cursor-pointer pointer-events-auto"
                  @click="deleteSpec(item.id)"
                >
                  <svg width="13" height="16" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:avocode="https://avocode.com/" viewBox="0 0 13 16"><defs></defs><g><g><title>Delete</title><image xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAQCAYAAADNo/U5AAAAU0lEQVQ4T2NkQANBQUH/0cXWrVvHiCyGwgFJgDQhK0Lng9QwYjMZ3SZ0PoZNhDSQbxM2N+OzDaQe7CeQx0mhSVIMM3xUEzSUKQsIYpIPLEGTlWAB2MDtgmErnM4AAAAASUVORK5CYII=" width="13" height="16" transform="matrix(1,0,0,1,0,0)" ></image></g></g></svg>
                </div>
              </td>
            </tr>
          </template>
        </DataTable>
      </div>
      <Button
        v-if="roleInOrg === 'OWNER' || roleInOrg === 'MANAGER' || roleInOrg === 'FREELANCER'"
        outline
        class="mt-6"
        @click="createSpec"
      >
        <template v-slot:icon>
          <Icon>{{ icons.mdiPlusCircleOutline }}</Icon>
        </template>
        <span>{{ $t('deals.createDeal') }}</span>
      </Button>
    </div>
  </div>
</template>

<script>
import { mdiPlusCircleOutline, mdiMagnify } from '@mdi/js'

import {
  Typename,
  Operation,
  SpecStatus,
  ClientType,
} from '../graphql/enums'
import { SPEC_FRAGMENT } from '../graphql/typeDefs'
import { GET_SPECS, GET_ORGS } from '../graphql/queries'
import { CREATE_SPEC, DELETE_SPEC } from '../graphql/mutations'
import { SPECS_DELTA } from '../graphql/subscriptions'

import { confirmDialog } from '@/util/helpers'

export default {
  name: 'Specs',
  apollo: {
    getSpecs: {
      query: GET_SPECS,
      variables () {
        return {
          orgId: this.orgId,
        }
      },
    },
    getOrgs: {
      query: GET_ORGS,
      fetchPolicy: 'cache-only',
    },
  },
  data () {
    return {
      SpecStatus,
      search: '',
      loading: false,
      createLoading: false,
      deleteLoading: null,
      icons: {
        mdiMagnify,
        mdiPlusCircleOutline,
      },
    }
  },
  computed: {
    roleInOrg () {
      const orgs = this.getOrgs || []
      const org = orgs.find(el => el.id === this.orgId) || {}
      return org.role || null
    },
    orgId () {
      return this.$route.params.orgId
    },
    headers () {
      return [
        { text: '', value: 'status', align: 'left', width: 45, bgcolor: 'tansparent', sortable: true },
        { text: '', value: 'coming', align: 'left', width: 45, bgcolor: 'tansparent', sortable: true },
        { text: '', value: 'spending', align: 'left', width: 45, bgcolor: 'tansparent', sortable: true },
        { text: this.$t('deals.clientUid'), value: 'clientUid', align: 'left', width: 80, bgcolor: 'tansparent', sortable: true },
        { text: this.$t('deals.clientName'), value: 'clientName', align: 'left', width: 200, minWidth: 200, bgcolor: 'tansparent', sortable: true },
        { text: this.$t('deals.clientPhone'), value: 'clientPhone', align: 'left', width: 165, bgcolor: 'tansparent', sortable: true },
        { text: this.$t('deals.specNo'), value: 'specNo', align: 'left', width: 220, minWidth: 220, bgcolor: 'tansparent', sortable: true },
        { text: this.$t('deals.createdAt'), value: 'createdAt', width: 120, minWidth: 120, bgcolor: 'tansparent' },
        { text: '', value: 'actions', width: 48, bgcolor: 'tansparent' },
      ]
    },
    items () {
      return this.getSpecs || []
    },
  },
  mounted () {
    const observer = this.$apollo.subscribe({
      query: SPECS_DELTA,
      fetchPolicy: 'no-cache',
    })

    const apolloClient = this.$apollo.provider.defaultClient

    observer.subscribe({
      next: ({ data }) => {
        const operation = data.delta.operation
        const typename = data.delta.payload.__typename

        this.$logger.info(`[${typename}]: ${JSON.stringify(data)}`)

        if (operation === Operation.INSERT_SPEC) {
          const { getSpecs } = apolloClient.readQuery({
            query: GET_SPECS,
            variables: { orgId: this.orgId },
          })

          if (!getSpecs.some(el => el.id === data.delta.payload.id)) {
            getSpecs.push(data.delta.payload)

            apolloClient.writeQuery({
              query: GET_SPECS,
              variables: { orgId: this.orgId },
              data: {
                getSpecs,
              },
            })
          }
        }

        if (operation === Operation.UPDATE_SPEC) {
          apolloClient.writeFragment({
            id: `${Typename.SPEC}:${data.delta.payload.id}`,
            fragment: SPEC_FRAGMENT,
            data: data.delta.payload,
          })
        }

        if (operation === Operation.DELETE_SPEC) {
          const { getSpecs } = apolloClient.readQuery({
            query: GET_SPECS,
            variables: { orgId: this.orgId },
          })

          const index = getSpecs.findIndex(el => el.id === data.delta.payload.id)

          if (index !== -1) {
            getSpecs.splice(index, 1)
            apolloClient.writeQuery({
              query: GET_SPECS,
              variables: { orgId: this.orgId },
              data: {
                getSpecs,
              },
            })
          }
        }
      },
      error: (error) => {
        this.$logger.warn('Error: ', error)
      },
    })
  },
  methods: {
    getClientName (item) {
      if (!item) return ''
      let name = ''
      if (item.clientType === ClientType.LEGAL) {
        name = item.companyNameSl || item.companyNameCl || ''
      } else {
        name = item.lastName || ''
        name += item.firstName ? ` ${item.firstName}` : ''
        name += item.middleName ? ` ${item.middleName}` : ''
      }
      return name
    },
    async createSpec () {
      try {
        this.createLoading = true
        const response = await this.$apollo.mutate({
          mutation: CREATE_SPEC,
          variables: {
            orgId: this.orgId,
          },
        })
        if (response && response.data && response.data.createSpec) {
          const spec = response.data.createSpec

          const { getSpecs } = this.$apollo.provider.defaultClient.readQuery({
            query: GET_SPECS,
            variables: { orgId: this.orgId },
          })

          if (!getSpecs.some(el => el.id === spec.id)) {
            getSpecs.push(spec)

            this.$apollo.provider.defaultClient.writeQuery({
              query: GET_SPECS,
              variables: { orgId: this.orgId },
              data: {
                getSpecs,
              },
            })
          }
        }
      } catch (error) {
        if (error.graphQLErrors) {
          for (let err of error.graphQLErrors) {
            const { message } = err
            if (message === 'ForbiddenError: Insufficient access rights') {
              alert('Только купившие ПРО аккаунт могут создавать Спецификацию.')
            }
          }
        } else {
          throw new Error(error)
        }
      } finally {
        this.createLoading = false
      }
    },
    async deleteSpec (id) {
      try {
        const msg = this.$t('alert.removeDeal')
        const confirm = await confirmDialog(msg)
        if (confirm === 'not_confirmed') {
          return
        }
        this.deleteLoading = id
        await this.$apollo.mutate({
          mutation: DELETE_SPEC,
          variables: {
            id,
          },
        })
        const { getSpecs } = this.$apollo.provider.defaultClient.readQuery({
          query: GET_SPECS,
          variables: { orgId: this.orgId },
        })

        const index = getSpecs.findIndex(el => el.id === id)

        if (index !== -1) {
          getSpecs.splice(index, 1)
          this.$apollo.provider.defaultClient.writeQuery({
            query: GET_SPECS,
            variables: { orgId: this.orgId },
            data: {
              getSpecs,
            },
          })
        }
      } catch (error) {
        if (error === 'not_confirmed') return
        throw new Error(error)
      } finally {
        this.deleteLoading = null
      }
    },
  },
}
</script>
