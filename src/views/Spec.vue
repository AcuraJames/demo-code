<template>
  <div>
    <component
      v-if="roleInProject"
      :is="componentName"
    />
  </div>
</template>

<script>
import deepmerge from 'deepmerge'

import OwnerSpec from '@/components/Owner/Spec.vue'
import ManagerSpec from '@/components/Manager/Spec.vue'
import AccountantSpec from '@/components/Accountant/Spec.vue'
import WarehousemanSpec from '@/components/Warehouseman/Spec.vue'
import FreelancerSpec from '@/components/Freelancer/Spec.vue'

import { Role, Typename, Operation } from '../graphql/enums'
import {
  SPEC_FRAGMENT,
  INVOICE_FRAGMENT,
  PRODUCT_FRAGMENT,
  SPEC_INVOICES_FRAGMENT,
  INVOICE_PRODUCTS_FRAGMENT,
} from '../graphql/typeDefs'
import {
  GET_SPEC,
  GET_ROLE_IN_PROJECT,
} from '../graphql/queries'
import { SPEC_DELTA } from '../graphql/subscriptions'

export default {
  name: 'Spec',
  components: {
    OwnerSpec,
    ManagerSpec,
    AccountantSpec,
    WarehousemanSpec,
    FreelancerSpec,
  },
  apollo: {
    roleInProject: {
      query: GET_ROLE_IN_PROJECT,
      variables () {
        return {
          specId: this.specId,
        }
      },
      fetchPolicy: 'cache-only',
    },
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
      role: null,
    }
  },
  computed: {
    specId () {
      return this.$route.params.specId
    },
    componentName () {
      switch (this.roleInProject) {
        case Role.OWNER: return 'OwnerSpec'
        case Role.MANAGER: return 'ManagerSpec'
        case Role.ACCOUNTANT: return 'AccountantSpec'
        case Role.WAREHOUSEMAN: return 'WarehousemanSpec'
        case Role.FREELANCER: return 'FreelancerSpec'
        default: return null
      }
    },
  },
  mounted () {
    const observer = this.$apollo.subscribe({
      query: SPEC_DELTA,
      variables: {
        specId: this.specId,
      },
      fetchPolicy: 'no-cache',
    })

    const apolloClient = this.$apollo.provider.defaultClient

    observer.subscribe({
      next: ({ data }) => {
        const delta = data.specDelta
        const operation = delta.operation
        const typename = delta.payload.__typename

        this.$logger.info(`[${typename}]: ${JSON.stringify(data)}`)

        // PRODUCT

        if (operation === Operation.INSERT_PRODUCT) {
          const parentInvoice = apolloClient.readFragment({
            id: `${Typename.INVOICE}:${delta.parentId}`,
            fragment: INVOICE_PRODUCTS_FRAGMENT,
            fragmentName: 'InvoiceProductsFragment',
          })

          if (!parentInvoice.products.some(el => el.id === delta.payload.id)) {
            parentInvoice.products.push(delta.payload)

            setTimeout(() => {
              apolloClient.writeFragment({
                id: `${Typename.INVOICE}:${delta.parentId}`,
                fragment: INVOICE_PRODUCTS_FRAGMENT,
                fragmentName: 'InvoiceProductsFragment',
                data: parentInvoice,
              })
            }, 0)
          }
        }

        if (operation === Operation.UPDATE_PRODUCT) {
          const cacheData = apolloClient.readFragment({
            id: `${Typename.PRODUCT}:${delta.payload.id}`,
            fragment: PRODUCT_FRAGMENT,
            fragmentName: 'ProductFragment',
          })
          const data = deepmerge(cacheData, delta.payload.fields)
          apolloClient.writeFragment({
            id: `${Typename.PRODUCT}:${delta.payload.id}`,
            fragment: PRODUCT_FRAGMENT,
            data,
          })
        }

        if (operation === Operation.DELETE_PRODUCT) {
          let parentInvoice = apolloClient.readFragment({
            id: `${Typename.INVOICE}:${delta.parentId}`,
            fragment: INVOICE_PRODUCTS_FRAGMENT,
            fragmentName: 'InvoiceProductsFragment',
          })

          const index = parentInvoice.products.findIndex(p => p.id === delta.payload.id)

          if (index !== -1) {
            parentInvoice.products.splice(index, 1)
            apolloClient.writeFragment({
              id: `${Typename.INVOICE}:${delta.parentId}`,
              fragment: INVOICE_PRODUCTS_FRAGMENT,
              fragmentName: 'InvoiceProductsFragment',
              data: parentInvoice,
            })
          }
        }

        // INVOICE

        if (operation === Operation.INSERT_INVOICE) {
          const parentSpec = apolloClient.readFragment({
            id: `${Typename.SPEC}:${delta.parentId}`,
            fragment: SPEC_INVOICES_FRAGMENT,
            fragmentName: 'SpecInvoicesFragment',
          })

          if (!parentSpec.invoices.some(el => el.id === delta.payload.id)) {
            parentSpec.invoices.push(delta.payload)

            apolloClient.writeFragment({
              id: `${Typename.SPEC}:${delta.parentId}`,
              fragment: SPEC_INVOICES_FRAGMENT,
              fragmentName: 'SpecInvoicesFragment',
              data: parentSpec,
            })
          }
        }

        if (operation === Operation.UPDATE_INVOICE) {
          const cacheData = apolloClient.readFragment({
            id: `${Typename.INVOICE}:${delta.payload.id}`,
            fragment: INVOICE_FRAGMENT,
            fragmentName: 'InvoiceFragment',
          })
          const data = delta.payload.__typename === Typename.INVOICE
            ? Object.assign({}, cacheData, delta.payload)
            : Object.assign({}, cacheData, delta.payload.fields)
          apolloClient.writeFragment({
            id: `${Typename.INVOICE}:${delta.payload.id}`,
            fragment: INVOICE_FRAGMENT,
            fragmentName: 'InvoiceFragment',
            data,
          })
        }

        if (operation === Operation.DELETE_INVOICE) {
          let parentSpec = apolloClient.readFragment({
            id: `${Typename.SPEC}:${delta.parentId}`,
            fragment: SPEC_INVOICES_FRAGMENT,
            fragmentName: 'SpecInvoicesFragment',
          })

          const index = parentSpec.invoices.findIndex(p => p.id === delta.payload.id)

          if (index !== -1) {
            parentSpec.invoices.splice(index, 1)
            apolloClient.writeFragment({
              id: `${Typename.SPEC}:${delta.parentId}`,
              fragment: SPEC_INVOICES_FRAGMENT,
              fragmentName: 'SpecInvoicesFragment',
              data: parentSpec,
            })
          }
        }

        // SPEC

        if (operation === Operation.UPDATE_SPEC) {
          const cacheData = apolloClient.readFragment({
            id: `${Typename.SPEC}:${delta.payload.id}`,
            fragment: SPEC_FRAGMENT,
            fragmentName: 'SpecFragment',
          })
          const data = delta.payload.__typename === Typename.SPEC
            ? Object.assign({}, cacheData, delta.payload)
            : Object.assign({}, cacheData, delta.payload.fields)
          apolloClient.writeFragment({
            id: `${Typename.SPEC}:${delta.payload.id}`,
            fragment: SPEC_FRAGMENT,
            fragmentName: 'SpecFragment',
            data,
          })
        }
      },
      error: (error) => {
        this.$logger.warn('Error: ', error)
      },
    })
  },
}
</script>
