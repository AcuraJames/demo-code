<template>
  <div class="modal">
    <div class="modal-header">
      <svg width="29" height="28" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:avocode="https://avocode.com/" viewBox="0 0 29 28"><defs></defs><g><g><title>&lt;Path&gt;</title><path d="M4.2219,8.6869c-0.263,-0.027 -0.501,-0.171 -0.648,-0.392l-2.681,-4.079c-0.228,-0.348 -0.181,-0.81 0.113,-1.105l1.396,-1.399c0.296,-0.296 0.758,-0.341 1.106,-0.113l4.08,2.68c0.222,0.145 0.365,0.382 0.393,0.645c0.027,0.263 -0.066,0.525 -0.253,0.712l-0.809,0.81l5.144,5.143l0.553,-0.552c0.058,-0.058 0.119,-0.112 0.181,-0.164c-1.036,-2.528 -0.393,-5.116 1.857,-7.37l2.013,-2.01c2.197,-2.196 4.785,-1.549 7.254,-0.518l1.212,0.507l-3.254,3.252c-1.262,1.263 -0.852,1.885 -0.322,2.414l0.062,0.061c0.535,0.537 0.903,0.546 1.14,0.504c0.369,-0.064 0.801,-0.34 1.28,-0.82l3.251,-3.254l0.507,1.213c1.03,2.47 1.681,5.058 -0.518,7.255l-2.009,2.01c-1.445,1.444 -3.031,2.159 -4.689,2.161l4.923,4.991c0.613,0.611 0.907,1.461 0.827,2.388c-0.076,0.87 -0.478,1.71 -1.136,2.367c-0.781,0.783 -1.748,1.201 -2.708,1.201c-0.812,0 -1.559,-0.3 -2.103,-0.844l-6.394,-6.48l-5.689,5.688c-0.563,0.563 -1.316,0.839 -2.101,0.839c-0.928,0 -1.902,-0.386 -2.658,-1.14l-0.064,-0.066c-0.647,-0.645 -1.05,-1.486 -1.127,-2.356c-0.081,-0.928 0.215,-1.779 0.83,-2.394l7.639,-7.638l-5.145,-5.144l-0.742,0.743c-0.165,0.167 -0.39,0.258 -0.622,0.258c-0.03,0 -0.059,-0.001 -0.089,-0.004zM16.3269,14.4709l-2.629,2.629l7.935,8.041c0.267,0.267 0.612,0.324 0.854,0.324c0.496,0 1.011,-0.23 1.412,-0.631c0.418,-0.419 0.639,-0.871 0.679,-1.329c0.035,-0.402 -0.079,-0.755 -0.322,-0.998zM13.3089,12.8339l1.084,1.083l1.587,-1.585l0.529,0.199c0.397,0.149 0.737,0.365 1.011,0.642l0.685,0.694c2.116,1.124 4.023,0.804 5.821,-0.995l2.01,-2.01c1.026,-1.025 1.222,-2.166 0.606,-4.083l-1.357,1.357c-0.751,0.751 -1.479,1.18 -2.223,1.31c-0.658,0.114 -1.658,0.038 -2.679,-0.986l-0.062,-0.061c-0.862,-0.862 -1.959,-2.636 0.315,-4.91l1.357,-1.357c-1.914,-0.617 -3.055,-0.421 -4.08,0.606l-2.013,2.011c-1.932,1.933 -2.333,3.968 -1.19,6.049l0.49,0.89l-0.952,0.357c-0.161,0.06 -0.287,0.138 -0.386,0.236zM12.0649,14.0779l-7.639,7.638c-0.242,0.241 -0.356,0.596 -0.32,0.996c0.039,0.46 0.261,0.911 0.625,1.274l0.064,0.067c0.701,0.698 1.721,0.834 2.262,0.292l5.697,-5.698l-0.358,-0.363c-0.274,-0.273 -0.489,-0.611 -0.636,-1.005l-0.2,-0.529l1.588,-1.588zM2.7579,3.8479l1.695,2.576l1.267,-1.267l-2.577,-1.694z" fill="#aaaaaa" fill-opacity="1"></path></g></g></svg>
      <span class="ml-3">{{ $t('paper.paperConfigurator') }}</span>
    </div>
    <div class="modal-body">
      <ul>
        <li
          v-for="item in items" :key="item.id"
          class="flex py-3 px-10 hover:bg-accent1"
          @click="$emit('openPaper', item.id)"
        >
          <span class="flex-grow text-sm cursor-pointer">{{ item.name }}</span>
          <span class="mr-6 cursor-pointer text-primary">
            <Icon size="24">
              {{ icons.ziGear }}
            </Icon>
          </span>
          <span
            class="cursor-pointer text-primary"
            @click.stop="deleteContract(item.id)"
          >
            <Icon size="24">
              {{ icons.ziTrash }}
            </Icon>
          </span>
        </li>
      </ul>
    </div>
    <div class="modal-footer">
      <Button
        outline
        class="my-5 ml-8"
        @click="$emit('createPaper')"
      >
        <template v-slot:icon>
          <Icon>{{ icons.mdiPlusCircleOutline }}</Icon>
        </template>
        <span>{{ $t('paper.createPaper') }}</span>
      </Button>
    </div>
    <span class="close-btn" @click="$emit('close')">
      &times;
    </span>
  </div>
</template>

<script>
import { mdiPlusCircleOutline } from '@mdi/js'
import { ziGear, ziTrash } from '@/assets/icons'

import { LIST_ORG_CONTRACTS } from '../graphql/queries'
import { DELETE_СONTRACT } from '../graphql/mutations'

import { confirmDialog } from '@/util/helpers'

export default {
  name: 'PaperListModal',
  props: {
    items: {
      type: Array,
      default: () => ([]),
    },
  },
  data () {
    return {
      icons: {
        ziGear,
        ziTrash,
        mdiPlusCircleOutline,
      },
    }
  },
  methods: {
    async deleteContract (id) {
      try {
        const msg = this.$t('alert.removeContract')
        const confirm = await confirmDialog(msg)
        if (confirm === 'not_confirmed') {
          return
        }
        const response = await this.$apollo.mutate({
          mutation: DELETE_СONTRACT,
          variables: { id },
          update: (store) => {
            const data = store.readQuery({
              query: LIST_ORG_CONTRACTS,
              variables: {
                orgId: this.$route.params.orgId,
              },
            })
            const index = data.listOrgContracts.findIndex(item => item.id === id)
            if (index !== -1) {
              data.listOrgContracts.splice(index, 1)
            }
            store.writeQuery({
              query: LIST_ORG_CONTRACTS,
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
      }
    },
  },
}
</script>

<style scoped lang="postcss">
  .modal {
    display: flex;
    flex-direction: column;
    position: relative;
    @apply bg-gray;
  }
  .modal-header {
    width: 100%;
    max-width: 443px;
    height: 70px;
    padding: 25px;
    display: flex;
    align-items: center;
    color: #aaaaaa;
    @apply bg-gray-darkest;
  }
  .modal-body {
    height: 382px;
    padding: 20px 0;
    overflow-y: auto;
    color: #CDCDCD;
  }
  .close-btn {
    position: absolute;
    top: 5px;
    right: 15px;
    color: #fff;
    cursor: pointer;
  }
  .access {
    margin: 0;
  }
</style>
