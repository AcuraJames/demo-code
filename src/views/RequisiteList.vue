<template>
  <div class="container container--sm">
    <div class="py-10">

       <div class="overflow-x-auto">
        <DataTable
          :headers="headers"
          :items="items"
          table-width="100%"
          table-class="table-fixed"
          thead-class="text-accent2 border-b border-accent2 bg-background"
        >
          <template v-slot:items="{ items }">
            <tr
              v-for="(item) in items"
              :key="item.id"
              class="items bg-background hover:bg-accent3 border-none"
              @click="$router.push({
                name: 'requisite',
                params: {
                  reqId: item.id
                }
              })"
            >
              <td>{{ item.name }}</td>
              <td>{{ item.nameEng }}</td>
              <td>{{ item.ownerFullName }}</td>
              <td class="text-right pointer-events-none" @click.prevent.stop>
                <div
                  class="cursor-pointer pointer-events-auto"
                  @click="deleteRequisite(item.id)"
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
          name: 'requisite-create'
        })"
      >
        <template v-slot:icon>
          <Icon>{{ icons.mdiPlusCircleOutline }}</Icon>
        </template>
        <span>{{ $t('requisites.addRequisites') }}</span>
      </Button>
    </div>
  </div>
</template>

<script>
import { mdiPlusCircleOutline } from '@mdi/js'

import { LIST_ORG_REQUISITES } from '../graphql/queries'
import { DELETE_REQUISITE } from '../graphql/mutations'

import { confirmDialog } from '@/util/helpers'

export default {
  name: 'RequisiteList',
  apollo: {
    listOrgRequisites: {
      query: LIST_ORG_REQUISITES,
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
      icons: {
        mdiPlusCircleOutline,
      },
      deleteLoading: null,
    }
  },
  computed: {
    orgId () {
      return this.$route.params.orgId
    },
    headers () {
      return [
        { text: this.$t('requisites.companyName'), value: 'name', bgcolor: 'tansparent', align: 'left' },
        { text: this.$t('requisites.companyNameEng'), value: 'nameEng', bgcolor: 'tansparent', align: 'left' },
        { text: this.$t('requisites.fullName'), value: 'ownerFullName', bgcolor: 'tansparent', align: 'left' },
        { text: '', value: 'action', bgcolor: 'tansparent' },
      ]
    },
    items () {
      return this.listOrgRequisites || []
    },
  },
  methods: {
    async deleteRequisite (id) {
      try {
        const msg = this.$t('alert.removeRequisites')
        const confirm = await confirmDialog(msg)
        if (confirm === 'not_confirmed') {
          return
        }
        this.deleteLoading = id
        const response = await this.$apollo.mutate({
          mutation: DELETE_REQUISITE,
          variables: { id },
          update: (store) => {
            const data = store.readQuery({
              query: LIST_ORG_REQUISITES,
              variables: {
                orgId: this.orgId,
              },
            })
            const index = data.listOrgRequisites.findIndex(item => item.id === id)
            if (index !== -1) {
              data.listOrgRequisites.splice(index, 1)
            }
            store.writeQuery({
              query: LIST_ORG_REQUISITES,
              variables: {
                orgId: this.orgId,
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
      } finally {
        this.deleteLoading = null
      }
    },
  },
}
</script>

<style>

</style>
