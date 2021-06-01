<template>
  <div class="modal">

    <v-dialog
      v-model="requisiteList"
      max-width="400"
    >
      <PaperCompanyListModal
        ref="requisiteList"
        @openRequisiteDialog="openRequisiteDialog"
        @chooseRequisite="chooseRequisite"
      />
    </v-dialog>

    <v-dialog
      v-model="saveBeforeClose"
      max-width="520"
    >
      <SaveBeforeCloseModal
        :text=" `${$t('paper.saveChanges')} ${$t('paper.supplyContract')} ${$t('paper.beforeClosing')}`"
        :postScriptum="$t('paper.ifNotSave')"
        @dontSave="doNotSaveContractChanges"
        @cancel="cancel"
        @save="saveContractChanges"
      />
    </v-dialog>

    <v-dialog
      ref="requisiteDialog"
      v-model="requisiteDialog"
      scrollable
      max-width="1024"
      :fullscreen="$vuetify.breakpoint.xs"
    >
      <RequisiteCard
        ref="requisiteCard"
        :org-id="$route.params.orgId"
        create
        is-component
        @close="requisiteDialog = false"
        @create="setCreatedRequisite"
      />
    </v-dialog>

    <div class="modal-header">
      <Icon size="28">
        {{ icons.ziPencil }}
      </Icon>
      <TextField
        v-model="contract.name"
        :placeholder="$t('paper.name')"
        outlined
        hide-details
        class="w-5/6 ml-6"
      />
    </div>
    <div class="modal-body">

      <div class="modal-paper">
        <div class="paper-title">
          <div class="flex flex-col md:flex-row justify-between">
            <span class="paper-title__title mb-8 md:mt-0">
              <Editable
                v-model="contract.title"
                :placeholder="$t('paper.heading')"
                type="editable"
                single-line
                text-dark
                hide-details
              />
            </span>
            <v-tooltip top max-width="600">
              <template v-slot:activator="{ on }">
                <span class="paper-title__number" v-on="on">A0000-26082020-1</span>
              </template>
              <span class="text-sm">
                {{ $t('paper.specNumber') }}
              </span>
            </v-tooltip>
          </div>
          <div class="paper-title__info">
            <span>
              <TextField
                v-model="contract.country"
                :placeholder="$t('paper.location')"
                single-line
                text-dark
                hide-details
              />
            </span>
            <v-tooltip top max-width="340">
              <template v-slot:activator="{ on }">
                <span class="mt-8 sm:mt-0" v-on="on">{{ $t('paper.date') }}</span>
              </template>
              <span class="text-sm">
                {{ $t('paper.paperDate') }}
              </span>
            </v-tooltip>
          </div>
          <div class="paper-title__textfield mt-8">
            <TextArea
              v-model="contract.docHeader"
              :disabled="contract.useDefaultDocHeader"
              :placeholder="$t('paper.textField')"
              hide-details
              single-line
              text-dark
              transparent
              rows="1"
            />
          </div>
          <Checkbox
            :value="contract.useDefaultDocHeader"
            class="-ml-6 text-primary"
            hide-details
            vertical-align
            @input="useDefaultHeader"
          >
            <span class="ml-2 mb-2 text-sm text-black">{{ $t('paper.contractHeader') }}</span>
          </Checkbox>
        </div>

        <div
          v-for="(item, index) in contract.items" :key="index"
          class="paper-custom-paragraph mt-10"
        >
          <div class="paper-custom-paragraph__title heading">
            <span
              class="heading__number flex items-center cursor-pointer"
              @click="changePos(index, contract.items)"
            >
              <i v-if="index > 0" class="text-primary">
                <Icon
                  size="24"
                  class="icon-move-up--heading"
                >
                  {{ icons.ziChevronUpCircle }}
                </Icon>
              </i>
              <span>{{ index + 1 }}.</span>
            </span>
            <TextField
              v-model="item.title"
              :placeholder="$t('paper.paragraphHeading')"
              single-line
              text-dark
              hide-details
            />
            <span
              class="remove-item"
              @click="removeItem(contract.items, index)"
            >
              <i>
                <img src="@/assets/icons/delete-circle.svg" alt="Remove">
              </i>
              <!-- <Icon icon-name="delete-circle" /> -->
            </span>
          </div>
          <div>
            <div
              v-for="(paragraph, idx) in item.paragraphs" :key="idx"
              class="paragraph relative"
            >
              <span
                class="paragraph__number flex cursor-pointer"
                @click="changePos(idx, item.paragraphs)"
              >
                <i v-if="idx > 0" class="text-primary">
                  <Icon
                    size="24"
                    class="icon-move-up--paragraph"
                  >
                    {{ icons.ziChevronUpCircle }}
                  </Icon>
                </i>
                <span>{{ index + 1 }}.{{ idx + 1 }}.</span>
              </span>
              <TextArea
                v-model="item.paragraphs[idx]"
                :placeholder="$t('paper.paragraph')"
                hide-details
                single-line
                text-dark
                transparent
                rows="1"
                auto-grow
              />
              <span
                class="remove-item"
                @click="removeParagraph(contract.items, index, idx)"
              >
                <i>
                  <img src="@/assets/icons/delete-circle.svg" alt="Remove">
                </i>
                <!-- <Icon icon-name="delete-circle" /> -->
              </span>
            </div>
          </div>
          <Button
            small
            outline
            class="mt-4"
            @click="addParagraph(contract.items, index)"
          >
            <template v-slot:icon>
              <Icon size="16">{{ icons.mdiPlusCircleOutline }}</Icon>
            </template>
            <span class="text-sm">{{ $t('paper.addParagraph') }}</span>
          </Button>
        </div>

        <Button
          outline
          class="mt-10"
          @click="addHeading(contract.items)"
        >
          <template v-slot:icon>
            <Icon>{{ icons.mdiPlusCircleOutline }}</Icon>
          </template>
          <span>{{ $t('paper.addHeading') }}</span>
        </Button>

        <div class="paper-requisites mt-10">
          <div class="paper-requsites__title heading">
            <span class="heading__number flex items-center">
                <span>{{ contract.items.length + 1 }}.</span>
              </span>
            <span>{{ $t('paper.details') }}</span>
          </div>

          <div class="paper-details mt-16 flex flex-col md:flex-row justify-around text-sm">
            <div class="w-full md:w-1/2 pl-4 md:pr-10 leading-none relative">
              <ul>
                <li class="flex">
                  <span class="-ml-4 mr-2">{{ $t('paper.requisites.supplier') }}</span>
                  <div
                    class="paper-details__requisite"
                    @click="openRequisiteList"
                  >
                    <Icon>
                      {{ icons.ziGear }}
                    </Icon>
                    <span class="requisite__company-name">{{ requisite.name || '_ _ _ _ _ _' }}</span>
                  </div>
                </li>
                <li class="flex">
                  <span class="w-1/3 -ml-4 mr-2">{{ $t('paper.requisites.address') }}</span>
                  <span class="w-2/3">{{ requisite.legalAddress }}</span>
                </li>
                <li class="flex">
                  <span class="w-1/3 -ml-4 mr-2">{{ $t('paper.requisites.postcode') }}</span>
                  <span class="w-2/3">{{ requisite.leagalAddressPostcode || '_ _ _ _ _ _' }}</span>
                </li>
                <li class="flex mt-4">
                  <span class="w-1/3 -ml-4 mr-2">{{ $t('paper.requisites.phone') }}</span>
                  <span class="w-2/3">{{ requisite.phone }}</span>
                </li>
                <li class="flex">
                  <span class="w-1/3 -ml-4 mr-2">{{ $t('paper.requisites.fax') }}</span>
                  <span class="w-2/3">{{ requisite.fax }}</span>
                </li>
                <li class="flex">
                  <span class="w-1/3 -ml-4 mr-2">{{ $t('paper.requisites.email') }}</span>
                  <span class="w-2/3">{{ requisite.email }}</span>
                </li>
                <li class="flex mt-4">
                  <span class="w-1/3 -ml-4 mr-2">{{ $t('paper.requisites.bank') }}</span>
                  <span class="w-2/3">{{ requisite.bankName }}</span>
                </li>
                <li class="flex">
                  <span class="w-1/3 -ml-4 mr-2">{{ $t('paper.requisites.bankAddress') }}</span>
                  <span class="w-2/3">{{ requisite.bankAddress }}</span>
                </li>
                <li class="flex mt-4">
                  <span class="w-1/3 -ml-4 mr-2">{{ $t('paper.requisites.accountNumber') }}</span>
                  <span class="w-2/3">{{ requisite.bankAccountNumber }}</span>
                </li>
                <li class="flex">
                  <span class="w-1/3 -ml-4 mr-2">{{ $t('paper.requisites.swift') }}</span>
                  <span class="w-2/3">{{ requisite.swift }}</span>
                </li>
                <li class="flex">
                  <span class="w-1/3 -ml-4 mr-2">{{ $t('paper.requisites.fullName') }}</span>
                  <span class="w-2/3">{{ requisite.ownerFullName }}</span>
                </li>
                <li class="flex">
                  <span class="w-1/3 -ml-4 mr-2">{{ $t('paper.requisites.position') }}</span>
                  <span class="w-2/3">{{ requisite.ownerJobPosition }}</span>
                </li>
                <li class="flex mt-4">
                  <span class="w-1/3 -ml-4 mr-2">{{ $t('paper.requisites.signatureStamp') }}</span>
                  <span class="w-2/3">_____________________</span>
                </li>
              </ul>
            </div>
            <div class="w-full md:w-1/2 mt-8 -ml-5 md:ml-0 md:mt-0 paper-buyer-details">
              {{ $t('paper.buyerDetails') }}
            </div>
          </div>

        </div>
      </div>

      <div class="modal-paper mt-4">
        <div class="paper-title">
          <div class="paper-title__title">
            <span>{{ $t('paper.specification') }} №A0000-26082020-1</span>
            <span class="block"> {{ $t('paper.to') }}
              <span class="text-gray-lighter">{{ contract.title }}</span>
            </span>
          </div>
          <div class="paper-title__info">
            <span>
               <TextField
                v-model="contract.country"
                :placeholder="$t('paper.location')"
                single-line
                text-dark
                hide-details
              />
            </span>
              <v-tooltip top max-width="340">
                <template v-slot:activator="{ on }">
                  <span v-on="on">{{ $t('paper.date') }}</span>
                </template>
                <span class="text-sm">
                  {{ $t('paper.paperDate') }}
                </span>
              </v-tooltip>
            </div>
          </div>
        <div class="paper-delivery-item mt-10">
          <div class="paper-delivery-item__title heading">
            <span class="heading__number heading__nubmer--first">
                <span>1.</span>
              </span>
              <!-- SET VALUE {paper.deliveryItem} BY DEFAULT -->
            <TextField
              v-model="contract.specItems[0].title"
              :placeholder="$t('paper.deliveryItem')"
              single-line
              text-dark
              hide-details
            />
          </div>
          <div class="paper-table">
            {{ $t('paper.table') }}
          </div>

        </div>
        <div
          v-for="(item, index) in contract.specItems.slice(1)" :key="index"
          class="paper-custom-paragraph mt-10"
        >
          <div class="paper-custom-paragraph__title heading">
            <span
              class="heading__number flex items-center cursor-pointer"
              @click="changePos(index + 1, contract.specItems)"
            >
              <i v-if="index > 0" class="text-primary">
                <Icon
                  size="24"
                  class="icon-move-up--heading"
                >
                  {{ icons.ziChevronUpCircle }}
                </Icon>
              </i>
              <span>{{ index + 2 }}.</span>
            </span>
            <TextField
              v-model="item.title"
              :placeholder="$t('paper.paragraphHeading')"
              single-line
              text-dark
              hide-details
            />
            <span
              class="remove-item"
              @click="removeItem(contract.specItems, index + 1)"
            >
              <i>
                <img src="@/assets/icons/delete-circle.svg" alt="Remove">
              </i>
            </span>
          </div>
          <div
            v-for="(paragraph, idx) in item.paragraphs" :key="idx"
            class="paragraph relative"
          >
            <span
              class="paragraph__number flex cursor-pointer"
              @click="changePos(idx, item.paragraphs)"
            >
              <i v-if="idx > 0" class="text-primary">
                <Icon
                  size="24"
                  class="icon-move-up--paragraph"
                >
                  {{ icons.ziChevronUpCircle }}
                </Icon>
              </i>
              <span>{{ index + 2 }}.{{ idx + 1 }}.</span>
            </span>
            <TextArea
              v-model="item.paragraphs[idx]"
              :placeholder="$t('paper.paragraph')"
              hide-details
              single-line
              text-dark
              transparent
              rows="1"
            />
            <span
              class="remove-item"
              @click="removeParagraph(contract.specItems, index + 1, idx)"
            >
              <i>
                <img src="@/assets/icons/delete-circle.svg" alt="Remove">
              </i>
            </span>
          </div>
          <Button
            small
            outline
            class="mt-4"
            @click="addParagraph(contract.specItems, index + 1)"
          >
            <template v-slot:icon>
              <Icon size="16">{{ icons.mdiPlusCircleOutline }}</Icon>
            </template>
            <span class="text-sm">{{ $t('paper.addParagraph') }}</span>
          </Button>
        </div>

        <Button
          outline
          class="mt-10"
          @click="addHeading(contract.specItems)"
        >
          <template v-slot:icon>
            <Icon>{{ icons.mdiPlusCircleOutline }}</Icon>
          </template>
          <span>{{ $t('paper.addHeading') }}</span>
        </Button>
      </div>

    </div>
    <div class="modal-footer">
      <Button
        large
        class="mr-8"
        @click="update"
      >
        <span>{{ $t('action.save') }}</span>
      </Button>
    </div>
    <span
      class="close-btn"
      @click="beforeClose"
    >
      <Icon>{{ icons.mdiClose }}</Icon>
    </span>
  </div>
</template>

<script>
import cloneDeep from 'clone-deep'
import deepEqual from 'deep-equal'

import { mdiPlusCircleOutline, mdiClose } from '@mdi/js'
import { ziGear, ziPencil, ziChevronUpCircle } from '@/assets/icons'

import { apolloClient } from '../plugins/apollo'

import { GET_ORG_REQUISITE } from '../graphql/queries'
import { CREATE_CONTRACT, UPDATE_СONTRACT } from '../graphql/mutations'

import PaperCompanyListModal from '@/components/PaperCompanyListModal.vue'
import SaveBeforeCloseModal from '@/components/SaveBeforeCloseModal.vue'
import RequisiteCard from '@/components/RequisiteCard.vue'

export default {
  name: 'PaperConfiguratorModal',
  components: {
    PaperCompanyListModal,
    SaveBeforeCloseModal,
    RequisiteCard,
  },
  props: {
    blank: {
      type: Object,
      default: () => ({}),
    },
    create: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      icons: {
        ziGear,
        ziPencil,
        ziChevronUpCircle,
        mdiPlusCircleOutline,
        mdiClose,
      },
      contractMetaData: {
        name: '',
        title: '',
        country: '',
        docHeader: '',
        useDefaultDocHeader: false,
      },
      contract: {},
      contractClone: {},
      isStandardHeader: false,
      saveBeforeClose: false,
      requisiteList: false,
      requisiteDialog: false,
      requisite: {},
    }
  },
  computed: {
    orgId () {
      return this.$route.params.orgId
    },
    reqId () {
      return this.contract.requisiteId || ''
    },
  },
  watch: {
    blank (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.setData(newVal)
        if (newVal.requisiteId) {
          this.setCurrentRequisite(newVal.requisiteId)
        } else {
          this.requisite = {}
        }
      }
    },
  },
  created () {
    this.setData(this.blank)
    if (this.contract.requisiteId) {
      this.setCurrentRequisite(this.contract.requisiteId)
    }
  },
  methods: {
    addHeading (contract) {
      contract.push({
        title: '',
        paragraphs: [''],
      })
    },
    addParagraph (contract, index) {
      contract[index].paragraphs.push('')
    },
    removeItem (contract, index) {
      contract.splice(index, 1)
    },
    removeParagraph (contract, index, idx) {
      contract[index].paragraphs.splice(idx, 1)
    },
    useDefaultHeader () {
      this.contract.useDefaultDocHeader = !this.contract.useDefaultDocHeader
      if (this.contract.useDefaultDocHeader) {
        this.contract.docHeader = ''
      }
    },
    changePos (index, arr) {
      const curr = arr[index]
      const prev = arr[index - 1]

      arr.splice(index - 1, 1, curr)
      arr.splice(index, 1, prev)
    },
    async update () {
      try {
        let input = {}

        if (!this.create) input.id = this.contract.id

        for (const key in this.contractMetaData) {
          if (this.contract.hasOwnProperty(key)) {
            this.$set(input, key, this.contract[key])
          }
        }

        const items = []
        const specItems = []
        this.contract.items.forEach(item => {
          items.push({
            title: item.title,
            paragraphs: item.paragraphs,
          })
        })
        this.contract.specItems.forEach(specItem => {
          specItems.push({
            title: specItem.title,
            paragraphs: specItem.paragraphs,
          })
        })

        input.requisiteId = this.reqId

        this.$set(input, 'items', items)
        this.$set(input, 'specItems', specItems)

        const query = this.create ? CREATE_CONTRACT : UPDATE_СONTRACT

        const variables = this.create
          ? { orgId: this.orgId, input }
          : { id: this.contract.id, input }

        const response = await this.$apollo.mutate({
          mutation: query,
          variables,
        })
        if (response && response.data && response.data.createContract) {
          this.setData(response.data.createContract)
        }
        if (response && response.data && response.data.updateContract) {
          this.setData(response.data.updateContract)
        }
        this.$emit('update')
      } catch (error) {
        this.$logger.warn('Error: ', error)
        throw new Error(error)
      }
      this.$emit('close')
    },
    openRequisiteList () {
      this.requisiteList = true
      setTimeout(() => {
        this.$refs.requisiteList.update()
      }, 200)
    },
    async setCurrentRequisite (id) {
      const { data: { getOrgRequisite } } = await apolloClient.query({
        query: GET_ORG_REQUISITE,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      this.requisite = getOrgRequisite || {}
    },
    chooseRequisite (id) {
      this.setCurrentRequisite(id)
      this.contract.requisiteId = id
      this.requisiteList = false
    },
    setCreatedRequisite (requisite) {
      this.contract.requisiteId = requisite.id
      this.setCurrentRequisite(this.contract.requisiteId)
      this.requisiteDialog = false
      this.requisiteList = false
      setTimeout(() => {
        this.$refs.requisiteCard.reset()
        if (this.$refs.requisiteDialog.$refs.dialog) {
          this.$refs.requisiteDialog.$refs.dialog.scrollTop = 0
        }
      }, 200)
    },
    beforeClose () {
      if (!deepEqual(this.contract, this.contractClone, true)) {
        this.saveBeforeClose = true
      } else {
        this.$emit('close')
      }
    },
    doNotSaveContractChanges () {
      this.saveBeforeClose = false
      this.$emit('close')
    },
    cancel () {
      this.saveBeforeClose = false
    },
    saveContractChanges () {
      this.update()
      this.saveBeforeClose = false
      this.$emit('close')
    },
    openRequisiteDialog () {
      this.requisiteDialog = true
    },
    setData (item) {
      if (!item) return
      this.contract = item
      this.contractClone = cloneDeep(this.contract)
    },
  },
}
</script>

<style scoped lang="postcss">
  .modal {
    display: flex;
    flex-direction: column;
    position: relative;
    @apply bg-accent1;
  }
  .modal-header {
    max-width: 906px;
    height: 70px;
    padding: 25px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    z-index: 999;
    color: #aaaaaa;
    background-color: #666666;
  }
  .modal-header > input {
    @apply w-3/4 h-8 ml-4 pl-4;
    font-size: 18px;
    background-color: #565656;
    outline: none;
  }
  .modal-header > input::placeholder {
    font-size: 18px;
    color: #7e7e7e;
  }
  .modal-body {
    height: 100%;
    flex-grow: 1;
    overflow-y: auto;
    color: #CDCDCD;
    background-color: #131313;
  }
  .modal-paper {
    width: 100%;
    height: auto;
    padding: 50px 10px 60px 50px;
    color: #131313;
    background-color: #d0d0d0;
  }
  .paper-title input {
    min-width: 250px;
    width: auto;
    background-color: #d0d0d0;
    border-bottom: 1px solid #888888;
    outline: none;
  }
  .paper-title input::placeholder {
    color: #888888;
  }
  .paper-title__title,
  .paper-title__number {
    font-size: 24px;
  }
  .paper-title__info {
    margin-top: 50px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    color: #888888;
  }
  .paragraph {
    margin-top: 25px;
  }
  .modal-footer {
    width: 100%;
    height: 80px;
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    background-color: #666666;
  }
  .heading {
    position: relative;
    font-size: 21px;
    font-weight: 700 !important;
  }
  .heading .text-field--single-line input {
    width: 100%;
    font-weight: 700 !important;
    outline: none;
  }
  .heading > input::placeholder {
    color: #888888;
  }
  .heading__number,
  .paragraph__number {
    position: absolute;
    top: 0;
    left: -24px;
    color: #888888
  }
  .paragraph__number {
    left: -28px;
  }
  .icon-move-up--heading,
  .icon-move-up--paragraph {
    width: 20px;
    position: absolute;
    top: 2px;
    left: -26px
  }
  .icon-move-up--paragraph {
    top: -1px;
    left: -21px;
  }
  .remove-item {
    position: absolute;
    top: 0;
    right: 0;
    font-weight: normal;
    font-size: 16px;
    cursor: pointer;
  }
  .paper-details__requisite {
    @apply flex items-center text-primary cursor-pointer;
    position: absolute;
    top: -5px;
    left: 25%;
  }
  .requisite__company-name {
    @apply ml-2;
  }
  .requisite__company-name:hover {
    color: #6996B2;
  }
  .paper-buyer-details {
    padding: 96px 30px;
    font-size: 14px;
    text-align: center;
    color: #888888;
    background-color: #cbcbcb;
  }
  .paper-table {
    margin-top: 15px;
    margin-left: -30px;
    padding: 50px 20px;
    font-size: 14px;
    text-align: center;
    color: #888888;
    background-color: #cbcbcb;
  }
  .close-btn {
    position: absolute;
    top: 5px;
    right: 15px;
    z-index: 1000;
    color: #fff;
    cursor: pointer;
  }
  .access {
    margin: 0;
  }

  @screen md {
    .modal-header > input {
      @apply ml-10
    }
    .modal-paper {
      padding: 50px 60px 60px 110px;
    }
    /* .paper-details__requisite {
      right: 80px;
    } */
    .paper-table {
      margin-left: -60px;
      padding: 50px 145px;
    }
  }
  @screen sm {
    .paper-title__info {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
    .modal-paper {
      padding: 50px 30px 60px 90px;
    }
    .heading__number,
    .paragraph__number {
      left: -37px;
    }
    .icon-move-up--heading,
    .icon-move-up--paragraph {
      width: 25px;
      position: absolute;
      top: 0;
      left: -37px
    }
    .icon-move-up--heading,
    .paragraph__number {
      left: -42px;
    }
    .icon-move-up--heading {
      top: 2px;
    }
    .remove-item {
      right: -25px;
    }
  }
</style>
