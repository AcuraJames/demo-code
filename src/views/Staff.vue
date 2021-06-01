<template>
  <div>

    <StaffCreateModal
      v-model="createStaffDialog"
      @update="refetchInvitations"
    />

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

        <div class="overflow-x-auto pb-16">
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
            <template v-slot:header.debt="{ header }">
              <td
                :width="header.width + 'px'"
                class="px-3"
              >
                ($→)
              </td>
            </template>
            <template v-slot:header.fullName="{ header }">
              <td
                :width="header.width + 'px'"
                class="text-left pl-10"
              >
                {{ $t('staff.fullName') }}
              </td>
            </template>

             <template v-slot:items="{ items }">
              <template v-for="(item, index) in items">
                <tr :key="item.id" class="items bg-background hover:bg-accent3 border-none">
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
                  <td>
                    <span class="flex item-center" @click="toggle(index)">
                      <span>{{ item.inWorkCount }}</span>
                      <div class="icon" style="width:18px">
                        <div class="icon__item">
                          <Icon v-if="expanded.includes(index)">{{ icons.mdiChevronUp }}</Icon>
                          <Icon v-else>{{ icons.mdiChevronDown }}</Icon>
                        </div>
                      </div>
                    </span>
                  </td>
                  <td>{{ item.profit }}</td>
                  <td>{{ Math.ceil(((item.profit || 0) * 100) / (item.finalCost || 1)) }}%</td>
                  <td class="text-right">{{ item.finalObtainCost }}</td>
                  <td class="text-right">{{ item.finalCost }}</td>
                  <td class="text-left pl-10">{{ item.givenName }} {{ item.familyName }}</td>
                  <td class="text-left">{{ item.role | roleFilter }}</td>
                  <td class="text-right pointer-events-none" @click.prevent.stop>
                    <div
                      class="cursor-pointer pointer-events-auto"
                      @click="deleteProject(item.id)"
                    >
                      <svg width="13" height="16" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:avocode="https://avocode.com/" viewBox="0 0 13 16"><defs></defs><g><g><title>Delete</title><image xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAQCAYAAADNo/U5AAAAU0lEQVQ4T2NkQANBQUH/0cXWrVvHiCyGwgFJgDQhK0Lng9QwYjMZ3SZ0PoZNhDSQbxM2N+OzDaQe7CeQx0mhSVIMM3xUEzSUKQsIYpIPLEGTlWAB2MDtgmErnM4AAAAASUVORK5CYII=" width="13" height="16" transform="matrix(1,0,0,1,0,0)" ></image></g></g></svg>
                    </div>
                  </td>
                </tr>
                <template v-if="expanded.includes(index)" class="expanded">
                  <tr
                    v-for="(specItem, specIndex) in item.specs"
                    :key="`expand-${index}-${specItem.id}`"
                    class="items text-sm bg-chaos-black"
                  >
                    <!-- <td :colspan="headers.length" class="bg-chaos-black">
                      <DataTable
                        :headers="headers"
                        :items="item.specs"
                        hide-headers
                        table-width="100%"
                        table-class="table-fixed"
                        items-row-class="bg-chaos-black"
                        items-cell-class="bg-chaos-black"
                      />
                    </td> -->
                    <td class="text-right relative px-3">
                      <span
                        :class="[
                          'status-mini',
                          'status-indicator inline-block',
                          specItem.specStatus === SpecStatus.IN_PRODUCTION
                            ? 'status-indicator--orange' : specItem.specStatus === SpecStatus.IN_STOCK
                              ? 'status-indicator--green' : 'status-indicator--pink'
                        ]"
                      >
                      </span>
                    </td>
                    <td class="text-center relative">
                      <div v-if="specIndex == 0" class="staff__triangle"></div>
                      <strong>+$</strong>&nbsp;&nbsp;<strong>-$</strong>
                    </td>
                    <td>{{ specItem.profit || 0 }}</td>
                    <td>{{ Math.ceil(((specItem.profit || 0) * 100) / (specItem.finalCost || 1)) }}%</td>
                    <td class="text-right">{{ specItem.finalCost || 0 }}</td>
                    <td class="text-right">{{ specItem.finalObtainCost || 0 }}</td>
                    <td class="text-center">{{ specItem.customNumber || specItem.specNo || '' }}</td>
                    <td class="text-center">{{ getClientName(specItem.client) }}</td>
                    <td></td>
                  </tr>
                </template>
              </template>
            </template>
          </DataTable>
        </div>
        <div class="overflow-x-auto">
          <h4>Invitations</h4>
          <DataTable
            :headers="invitationsHeaders"
            :items="invitations"
            table-width="100%"
            table-class="table-fixed"
            thead-class="text-accent2 border-b border-accent2"
            items-row-class="bg-transparent border-none"
            items-cell-class="bg-transparent"
          >
            <template v-slot:item.invitationRole="{ item }">
              <td>
                {{ item.invitationRole | roleFilter }}
              </td>
            </template>
            <template v-slot:item.createdAt="{ item }">
              <td>
                {{ $d($parseDate(item.createdAt), 'short') }}
              </td>
            </template>
            <template v-slot:item.updatedAt="{ item }">
              <td>
                {{ $d($parseDate(item.updatedAt), 'short') }}
              </td>
            </template>
            <template v-slot:item.actions="{ item }">
              <td>
                <div
                  class="cursor-pointer pointer-events-auto"
                  @click="cancelInvitation(item.id)"
                >
                  <svg width="13" height="16" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:avocode="https://avocode.com/" viewBox="0 0 13 16"><defs></defs><g><g><title>Delete</title><image xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAQCAYAAADNo/U5AAAAU0lEQVQ4T2NkQANBQUH/0cXWrVvHiCyGwgFJgDQhK0Lng9QwYjMZ3SZ0PoZNhDSQbxM2N+OzDaQe7CeQx0mhSVIMM3xUEzSUKQsIYpIPLEGTlWAB2MDtgmErnM4AAAAASUVORK5CYII=" width="13" height="16" transform="matrix(1,0,0,1,0,0)" ></image></g></g></svg>
                </div>
              </td>
            </template>
          </DataTable>
        </div>
        <Button
          outline
          class="mt-6"
          @click="createStaffDialog = true"
        >
          <template v-slot:icon>
            <Icon>
              {{ icons.mdiPlusCircleOutline }}
            </Icon>
          </template>
          <span>{{ $t('staff.addStaff') }}</span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  mdiMagnify,
  mdiChevronUp,
  mdiChevronDown,
  mdiPlusCircleOutline,
} from '@mdi/js'

import StaffCreateModal from '../components/StaffCreateModal.vue'
import { LIST_ORG_INVITATIONS, LIST_STAFF } from '../graphql/queries'
import { CANCEL_INVITATION } from '../graphql/mutations'
import { SpecStatus, ClientType } from '../graphql/enums'
import { i18n } from '../plugins'

export default {
  name: 'Staff',
  components: {
    StaffCreateModal,
  },
  filters: {
    roleFilter: function (val) {
      return i18n.te(`role.${val}`)
        ? i18n.t(`role.${val}`) : val
    },
  },
  apollo: {
    listStaff: {
      query: LIST_STAFF,
      variables () {
        return {
          orgId: this.orgId,
        }
      },
    },
    listOrgInvitations: {
      query: LIST_ORG_INVITATIONS,
      variables () {
        return {
          orgId: this.orgId,
        }
      },
    },
  },
  data () {
    return {
      SpecStatus,
      search: '',
      loading: false,
      createLoading: false,
      deleteLoading: null,
      createStaffDialog: false,
      // items: [
      //   {
      //     status: 'ORANGE',
      //     inWork: 3,
      //     diff: '150 005',
      //     diffPercent: '50%',
      //     revenue: '300 000',
      //     costOfGoods: '150 000',
      //     fullName: 'Игорь Иванов',
      //     access: 'Директор',
      //   },
      // ],
      expanded: [],
      errors: [],
      icons: {
        mdiMagnify,
        mdiChevronUp,
        mdiChevronDown,
        mdiPlusCircleOutline,
      },
    }
  },
  computed: {
    items () {
      return (this.listStaff && this.listStaff.items) || []
    },
    orgId () {
      return this.$route.params.orgId
    },
    invitations () {
      return this.listOrgInvitations || []
    },
    headers () {
      return [
        { text: '', value: 'status', align: 'left', width: 45, bgcolor: 'tansparent', sortable: true },
        { text: this.$t('staff.inWork'), value: 'inWork', align: 'left', width: 80, minWidth: 80, bgcolor: 'tansparent', sortable: true },
        { text: this.$t('staff.diff'), value: 'profit', align: 'left', width: 60, minWidth: 60, bgcolor: 'tansparent' },
        { text: '(%)', value: 'diffPercent', align: 'left', width: 40, minWidth: 40, bgcolor: 'tansparent', sortable: true },
        { text: this.$t('staff.revenue'), value: 'finalObtainCost', align: 'right', width: 80, bgcolor: 'tansparent', sortable: true },
        { text: this.$t('staff.costOfGoods'), value: 'finalCost', align: 'right', width: 120, bgcolor: 'tansparent', sortable: true },
        { text: this.$t('staff.fullName'), value: 'fullName', align: 'left', width: 180, minWidth: 180, bgcolor: 'tansparent' },
        { text: this.$t('staff.access'), value: 'access', align: 'left', width: 120, minWidth: 120, bgcolor: 'tansparent' },
        { text: '', value: 'actions', width: 48, bgcolor: 'tansparent' },
      ]
    },
    invitationsHeaders () {
      return [
        { text: 'Given Name', width: 100, bgcolor: 'tansparent', value: 'invitationGivenName' },
        { text: 'Family name', width: 100, bgcolor: 'tansparent', value: 'invitationFamilyName' },
        { text: 'Email', bgcolor: 'tansparent', value: 'invitationEmail' },
        { text: 'Role', bgcolor: 'tansparent', value: 'invitationRole' },
        { text: 'Status', bgcolor: 'tansparent', value: 'status' },
        { text: 'Created At', width: 120, bgcolor: 'tansparent', value: 'createdAt' },
        { text: 'Updated At', width: 120, bgcolor: 'tansparent', value: 'updatedAt' },
        { text: '', value: 'actions', bgcolor: 'tansparent', width: 48 },
      ]
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
    // TODO: update on after mutation
    refetchInvitations () {
      this.$apollo.queries.listOrgInvitations.refetch()
    },
    async cancelInvitation (id) {
      try {
        await this.$apollo.mutate({
          mutation: CANCEL_INVITATION,
          variables: { id },
        })
        this.refetchInvitations()
      } catch (error) {
        throw new Error(error)
      }
    },
    toggle (index) {
      if (this.expanded.indexOf(index) > -1) {
        const expIndex = this.expanded.indexOf(index)
        this.expanded.splice(expIndex, 1)
      } else {
        this.expanded.push(index)
      }
    },
  },
}
</script>

<style>
.status-mini {
  transform: scale(0.6);
}
.items:hover  .traingle {
  @apply bg-gray;
}
.staff__triangle {
  width: 14px;
  height: 14px;
  transform: rotate(45deg);
  background-color: #0F0F0F;
  position: absolute;
  top: -7px;
  left: 15px;
}
</style>
