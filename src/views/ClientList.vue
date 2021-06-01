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
          height="40"
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
          <template v-slot:header.debt-content>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <span v-on="on">
                  ($→)
                </span>
              </template>
              <span>
                {{ $t('clients.clientsDebt') }}
              </span>
            </v-tooltip>
          </template>
          <template v-slot:header.deals-content>
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <img class="inline mr-1" src="../assets/icons/deals.png" v-on="on">
              </template>
              <span>
                {{ $t('clients.currentDealsAmount') }}
              </span>
            </v-tooltip>
          </template>
          <template v-slot:items="{ items }">
            <tr
              v-for="(item) in items"
              :key="item.id"
              class="items bg-background hover:bg-accent3 border-none"
              @click="$router.push({
                name: 'client',
                params: {
                  clientId: item.id
                }
              })"
            >
              <td></td>
              <td>{{ item.companyName || (`${item.lastName || ''} ${item.firstName || ''} ${item.middleName || ''}`) }}</td>
              <td>{{ item.phone || item.mobilePhone }}</td>
              <td>{{ item.contactPerson }}</td>
              <td></td>
              <td>{{ item.uid }}</td>
              <td>{{ item.deals }}</td>
              <td class="text-right pointer-events-none" @click.prevent.stop>
                <div
                  class="cursor-pointer pointer-events-auto"
                  @click="deleteClient(item.id)"
                >
                  <svg width="13" height="16" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:avocode="https://avocode.com/" viewBox="0 0 13 16"><defs></defs><g><g><title>Delete</title><image xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAQCAYAAADNo/U5AAAAU0lEQVQ4T2NkQANBQUH/0cXWrVvHiCyGwgFJgDQhK0Lng9QwYjMZ3SZ0PoZNhDSQbxM2N+OzDaQe7CeQx0mhSVIMM3xUEzSUKQsIYpIPLEGTlWAB2MDtgmErnM4AAAAASUVORK5CYII=" width="13" height="16" transform="matrix(1,0,0,1,0,0)" ></image></g></g></svg>
                </div>
              </td>
            </tr>
          </template>

        </DataTable>
      </div>
      <Button
        outline
        class="mt-6"
        @click="$router.push({
          name: 'client-create'
        })"
      >
        <template v-slot:icon>
          <Icon>{{ icons.mdiPlusCircleOutline }}</Icon>
        </template>
        <span>{{ $t('clients.createClient') }}</span>
      </Button>
    </div>
  </div>
</template>

<script>
import { mdiPlusCircleOutline, mdiMagnify } from '@mdi/js'

import { ClientType } from '@/graphql/enums'
import { LIST_CLIENTS } from '@/graphql/queries'
import { DELETE_CLIENT } from '@/graphql/mutations'

import { confirmDialog } from '@/util/helpers'

export default {
  name: 'ClientList',
  apollo: {
    listClients: {
      query: LIST_CLIENTS,
      variables () {
        return {
          orgId: this.$route.params.orgId,
        }
      },
      fetchPolicy: 'cache-and-network',
    },
  },
  data () {
    return {
      search: '',
      loading: false,
      createLoading: false,
      deleteLoading: null,
      errors: [],
      icons: {
        mdiMagnify,
        mdiPlusCircleOutline,
      },
    }
  },
  computed: {
    headers () {
      return [
        { text: '', value: 'debt', align: 'left', width: 60, bgcolor: 'tansparent', sortable: true, tooltip: this.$t('clients.clientsDebt') },
        { text: this.$t('label.client.companyName'), value: 'name', align: 'left', width: 220, minWidth: 220, bgcolor: 'tansparent', sortable: true },
        { text: this.$t('label.client.phone'), value: 'phone', align: 'left', width: 120, minWidth: 120, bgcolor: 'tansparent', sortable: true },
        { text: this.$t('label.client.contactPerson'), value: 'contactPerson', align: 'left', width: 165, bgcolor: 'tansparent', sortable: true },
        { text: '', value: 'coming', align: 'left', width: 45, bgcolor: 'tansparent' },
        { text: this.$t('label.client.uidAbr'), value: 'uid', align: 'left', width: 120, minWidth: 120, bgcolor: 'tansparent', sortable: true },
        { text: '', value: 'deals', width: 60, minWidth: 60, bgcolor: 'tansparent', sortable: true, tooltip: this.$t('clients.currentDealsAmount') },
        { text: '', value: 'actions', align: 'right', width: 48, bgcolor: 'tansparent' },
      ]
    },
    items () {
      return (this.listClients && this.listClients.items) || []
    },
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
    async deleteClient (id) {
      try {
        const msg = this.$t('alert.removeClient')
        const confirm = await confirmDialog(msg)
        if (confirm === 'not_confirmed') {
          return
        }
        this.deleteLoading = id
        const response = await this.$apollo.mutate({
          mutation: DELETE_CLIENT,
          variables: { id },
          update: (store) => {
            const data = store.readQuery({
              query: LIST_CLIENTS,
              variables: {
                orgId: this.$route.params.orgId,
              },
            })
            const index = data.listClients.items.findIndex(item => item.id === id)
            if (index !== -1) {
              data.listClients.items.splice(index, 1)
            }
            store.writeQuery({
              query: LIST_CLIENTS,
              variables: {
                orgId: this.$route.params.orgId,
              },
              data,
            })
          },
        })
        if (response && response.errors && response.errors.length > 0) {
          throw response
        }
      } catch (error) {
        if (error === 'not_confirmed') return
        this.errors = error.errors || []
        this.$logger.warn('Error: ', error)
        // Analytics.record({
        //   name: 'DeleteClientError',
        //   attributes: {
        //     error: message
        //   }
        // })
      } finally {
        this.deleteLoading = null
      }
    },
  },
}
</script>
