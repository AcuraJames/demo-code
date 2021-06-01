<template>
  <div>
    <v-dialog
      v-model="templateListDialog"
      max-width="480"
      overlay-color="#0f0f0f"
      overlay-opacity="0.6"
    >
      <TemplateListModal
        :templates="templates"
        :current-template="currentTemplate"
        :visibility="templateListDialog"
        @delete="deleteClientTemplate"
        @cancel="restoreTemplate"
        @close="templateListDialog = false"
        @set-template="setTemplate"
      />
    </v-dialog>
    <v-dialog
      v-model="templateSaveDialog"
      max-width="650"
      overlay-color="#0f0f0f"
      overlay-opacity="0.6"
    >
      <TemplateSaveModal
        ref="templateSave"
        :loading="createTemplateLoading"
        :visibility="templateSaveDialog"
        @save="createClientTemplate"
        @close="templateSaveDialog = false"
      />
    </v-dialog>

    <v-dialog
      v-model="saveBeforeCloseDialog"
      max-width="520"
    >
      <SaveBeforeCloseModal
        :text=" `${$t('paper.saveChanges')}${$t('paper.beforeClosing')}`"
        :postScriptum="$t('paper.ifNotSave')"
        @dontSave="$emit('confirm', 1)"
        @cancel="saveBeforeCloseDialog = false"
        @save="$emit('confirm', 2)"
      />
    </v-dialog>

    <div id="container" class="container">
      <div class="py-12">
        <div>
          <header class="header">
            <span class="header__title">{{ $t('client.clientCard') }}</span>
            <div class="header__actions">
              <ToggleButton
                v-if="!create"
                :value="editMode"
                small
                class="mr-2"
                @input="editMode=!editMode"
              >
                <span>{{ $t('client.edit') }}</span>
              </ToggleButton>
              <Button
                text
                class="inline-block mt-3 md:text-left md:mt-0"
                @click="showModalList"
              >
                <span class="text-sm">{{ $t('client.clientCardPatterns') }}</span>
              </Button>
            </div>
          </header>
          <div class="card__radio-group lg:block">
            <RadioButton
              :value="clientType"
              :label="legalType"
              :disables="!editMode"
              name="person-type"
              class="mr-6"
              @input="switchPersonType(legalType)"
            >
              <span>{{ $t('client.legalPersonAbr') }}</span>
            </RadioButton>
            <RadioButton
              :value="clientType"
              :label="naturalType"
              :disabled="!editMode"
              name="person-type"
              @input="switchPersonType(naturalType)"
            >
              <span>{{ $t('client.naturalPersonAbr') }}</span>
            </RadioButton>
          </div>
          <div class="flex justify-between relative">
            <TemplateCard
              template-name="client"
              :fields="legalFieldsSettings"
              :item="client"
              :is-disabled="!editMode"
              :class="{'template-card': isNaturalPerson}"
              @update-template="updateTemplate"
              @update-value="updateValue"
            >
              <template v-slot:prepand>
                <RadioButton
                  :value="clientType"
                  :label="legalType"
                  :disabled="!editMode"
                  center
                  name="client-type"
                  @input="switchPersonType(legalType)"
                >
                  <span>{{ $t('client.legalPerson') }}</span>
                </RadioButton>
              </template>
              <template v-slot:apend>
                <div :class="['text-center', { 'card__section--faded': isNaturalPerson }]">
                  <Button
                    large
                    :disabled="isNaturalPerson || !!updateLoading"
                    class="mb-4 mx-auto"
                    @click="update(naturalType)"
                  >
                    <span>{{ $t('client.save') }}</span>
                  </Button>
                  <Button
                    text
                    :disabled="isNaturalPerson"
                    class="mx-auto"
                    @click="saveAsTemplate"
                  >
                    <span class="text-sm">{{ $t('client.saveAsPattern') }}</span>
                  </Button>
                </div>
              </template>
            </TemplateCard>
            <TemplateCard
              template-name="client"
              :fields="naturalFieldsSettings"
              :item="client"
              :is-disabled="!editMode"
              :class="{ 'template-card': !isNaturalPerson }"
              @update-template="updateTemplate"
              @update-value="updateValue"
            >
              <template v-slot:prepand>
                <RadioButton
                  :value="clientType"
                  :label="naturalType"
                  :disabled="!editMode"
                  center
                  name="client-type"
                  @input="switchPersonType(naturalType)"
                >
                  <span>{{ $t('client.naturalPerson') }}</span>
                </RadioButton>
              </template>
              <template v-slot:apend>
                <div :class="['text-center', { 'card__section--faded': !isNaturalPerson }]">
                  <Button
                    large
                    :disabled="!isNaturalPerson || !!updateLoading"
                    class="mb-4 mx-auto"
                    @click="update(naturalType)"
                  >
                    <span>{{ $t('client.save') }}</span>
                  </Button>
                  <Button
                    text
                    :disabled="!isNaturalPerson"
                    class="mx-auto"
                    @click="saveAsTemplate"
                  >
                    <span class="text-sm">{{ $t('client.saveAsPattern') }}</span>
                  </Button>
                </div>
              </template>
            </TemplateCard>
          </div>
          <button
            class="back-to-list-btn"
            @click="$router.push({
              name: 'clients',
              params: {
                orgId,
              }
            })"
          >
            <Icon class="mr-2">
              {{ icons.mdiArrowLeft }}
            </Icon>
            {{ $t('client.backToClientsList') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// TODO install in dependencies
import cloneDeep from 'clone-deep'
import deepEqual from 'deep-equal'

import { mdiArrowLeft } from '@mdi/js'

import { ClientType } from '@/graphql/enums'
import { GET_CLIENT, LIST_CLIENT_TEMPLATES } from '@/graphql/queries'
import {
  CREATE_CLIENT,
  UPDATE_CLIENT,
  CREATE_CLIENT_TEMPLATE,
  DELETE_CLIENT_TEMPLATE,
} from '@/graphql/mutations'

import SaveBeforeCloseModal from '@/components/SaveBeforeCloseModal.vue'
import TemplateSaveModal from '@/components/TemplateSaveModal.vue'
import TemplateListModal from '@/components/TemplateListModal.vue'
import TemplateCard from '@/components/TemplateCard.vue'

export default {
  name: 'ClientCard',
  components: {
    SaveBeforeCloseModal,
    TemplateSaveModal,
    TemplateListModal,
    TemplateCard,
  },
  props: {
    orgId: {
      type: String,
      required: true,
    },
    create: {
      type: Boolean,
      default: false,
    },
  },
  apollo: {
    listClientTemplates: {
      query: LIST_CLIENT_TEMPLATES,
      variables () {
        return {
          orgId: this.orgId,
        }
      },
      fetchPolicy: 'cache-and-network',
    },
    getClient: {
      query: GET_CLIENT,
      variables () {
        return {
          id: this.$route.params.clientId,
        }
      },
      result ({ data, loading }) {
        if (loading) return
        this.setData(data.getClient)
      },
      skip () {
        return this.create
      },
      fetchPolicy: 'cache-and-network',
    },
  },
  data () {
    return {
      saveBeforeCloseDialog: false,
      templateChanged: false,
      createTemplateLoading: false,
      deleteTemplateLoading: null,
      loading: false,
      updateLoading: null,
      templateListDialog: false,
      templateSaveDialog: false,
      clientType: null,
      isExpanded: false,
      editMode: false,
      expanded: [],
      legalFieldsSettings: {
        customUid: {
          defaultValueKey: 'uid',
          label: 'uid',
          placeholder: 'uid',
        },
        companyName: {
          rows: 2,
        },
        legalAddress: {
          rows: 2,
        },
        legalAddressPostcode: {
          placeholder: 'postcode',
        },
        mailingAddress: {
          rows: 2,
        },
        mailingAddressPostcode: {
          placeholder: 'postcode',
        },
        phone: {},
        fax: {},
        email: {},
        itn: {},
        iec: {},
        psrn: {
          section: true,
        },
        bankName: {},
        bankAddress: {},
        bankAccountNumber: {
          placeholder: 'bankAccountNumberAbr',
        },
        correspondentAccountNumber: {
          placeholder: 'correspondentAccountNumberAbr',
        },
        bic: {},
        okpo: {},
        swift: {},
        ownerFullName: {},
        ownerJobPosition: {},
        consignee: {
          section: true,
          subtitle: 'shippingInfo',
        },
        shippingAddress: {
          label: 'deliveryAddress',
          placeholder: 'deliveryAddress',
          rows: 2,
        },
        contactPerson: {},
        contactMobilePhone: {
          label: 'mobilePhone',
          placeholder: 'mobilePhone',
        },
        legalTypeNote: {
          label: 'note',
          placeholder: 'note',
          section: true,
          subtitle: 'note',
          rows: 3,
        },
      },
      naturalFieldsSettings: {
        customUid: {
          defaultValueKey: 'uid',
          label: 'uid',
          placeholder: 'uidAbr',
        },
        firstName: {},
        lastName: {},
        middleName: {},
        passportId: {},
        mobilePhone: {},
        additionalPhone: {},
        address: {
          rows: 2,
        },
        deliveryAddress: {
          rows: 2,
        },
        naturalTypeNote: {
          label: 'note',
          placeholder: 'note',
          section: true,
          subtitle: 'note',
          rows: 3,
        },
      },
      client: {
        id: null,
        uid: null,
        clientType: null,
        template: {},
      },
      clientClone: {},
      icons: {
        mdiArrowLeft,
      },
    }
  },
  computed: {
    fieldsKeys () {
      return [
        ...this.legalFieldsKeys,
        ...this.naturalFieldsKeys,
      ]
    },
    templateFieldsKeys () {
      return [
        ...this.fieldsKeys,
        'templateName',
      ]
    },
    legalFieldsKeys () {
      return Object.keys(this.legalFieldsSettings)
    },
    naturalFieldsKeys () {
      return Object.keys(this.naturalFieldsSettings)
    },
    safeClientType () {
      return this.clientType || ClientType.NATURAL
    },
    hasDeepChange () {
      return !deepEqual(this.client, this.clientClone)
    },
    currentTemplate () {
      let result = null
      const template = (this.client && this.client.template) || {}
      if (
        (
          template.templateName === null ||
          template.templateName === 'default'
        ) &&
        this.fieldsKeys.every(k => template[k] === null)
      ) {
        return 'default'
      }
      let cTemplate = {}
      this.templateFieldsKeys.forEach(k => {
        cTemplate[k] = template[k] || null
      })
      for (const t of this.templates) {
        let c = {}
        this.templateFieldsKeys.forEach(k => {
          c[k] = t[k] || null
        })
        if (deepEqual(cTemplate, c)) {
          result = t.id
          break
        }
      }
      return result
    },
    templates () {
      return (this.listClientTemplates && this.listClientTemplates.items) || []
    },
    legalType () {
      return ClientType.LEGAL
    },
    naturalType () {
      return ClientType.NATURAL
    },
    isLegalPerson () {
      return this.clientType === this.legalType
    },
    isNaturalPerson () {
      return this.clientType === this.naturalType
    },
  },
  watch: {
    saveBeforeCloseDialog (val) {
      !val && this.$off('confirm')
    },
    templateListDialog (val) {
      if (!this.create && !val && this.templateChanged) {
        this.update(this.clientType)
        this.templateChanged = false
      }
    },
    templateSaveDialog (val) {
      if (val) {
        setTimeout(() => {
          this.$refs.templateSave.focusInput()
        }, 0)
      }
    },
  },
  created () {
    this.editMode = this.create
    if (this.create) {
      this.clientType = this.naturalType
      this.clientClone = cloneDeep(this.client)
    }
  },
  methods: {
    async checkChangesBeforeLeave (next) {
      if (this.hasDeepChange) {
        const r = await this.openConfirmDialog()
        if (r) {
          if (r === 2) {
            try {
              await this.update()
              return next()
            } catch (error) {
              this.$logger.warn('Error: ', error)
              return next(false)
            }
          } else {
            return next()
          }
        } else {
          return next(false)
        }
      } else {
        return next()
      }
    },
    async openConfirmDialog () {
      this.saveBeforeCloseDialog = true
      return new Promise((resolve) => {
        this.$on('confirm', result => {
          resolve(result)
        })
      })
    },
    async update (type) {
      try {
        let input = {
          clientType: this.clientType,
          template: {},
        }
        this.fieldsKeys.forEach(key => {
          input[key] = this.client[key] || null
        })
        const template = this.client.template || {}
        this.templateFieldsKeys.forEach(key => {
          input.template[key] = template[key] || null
        })

        const query = this.create ? CREATE_CLIENT : UPDATE_CLIENT

        const variables = this.create
          ? { orgId: this.orgId, input }
          : { id: this.client.id, input }

        this.updateLoading = type
        const response = await this.$apollo.mutate({
          mutation: query,
          variables,
        })
        if (response && response.data && response.data.createClient) {
          this.setData(response.data.createClient)
          this.editMode = false
          this.clientClone = cloneDeep(this.client)
          this.$router.push({
            name: 'client',
            params: {
              orgId: this.orgId,
              clientId: response.data.createClient.id,
            },
          })
        }
      } catch (error) {
        this.$logger.warn('Error: ', error)
        throw new Error(error)
      } finally {
        this.updateLoading = null
      }
    },
    setData (item) {
      if (!item) return
      this.clientType = item.clientType
      this.client = cloneDeep(item)
      this.clientClone = cloneDeep(this.client)
    },
    async createClientTemplate (templateName) {
      try {
        this.createTemplateLoading = true
        let input = {}
        const template = this.client.template || {}
        this.templateFieldsKeys.forEach(key => {
          input[key] = template[key] || null
        })
        input.templateName = templateName
        const fromClient = !this.create
          ? this.client.id
          : null

        await this.$apollo.mutate({
          mutation: CREATE_CLIENT_TEMPLATE,
          variables: {
            orgId: this.orgId,
            fromClient,
            input,
          },
        })
        this.$apollo.queries.listClientTemplates.refetch()
        this.client.template.templateName = templateName
        this.templateSaveDialog = false
      } catch (error) {
        throw new Error(error)
      } finally {
        this.createTemplateLoading = false
      }
    },
    async deleteClientTemplate (id) {
      try {
        this.deleteTemplateLoading = id
        await this.$apollo.mutate({
          mutation: DELETE_CLIENT_TEMPLATE,
          variables: { id },
        })
        this.$apollo.queries.listClientTemplates.refetch()
      } catch (error) {
        throw new Error(error)
      } finally {
        this.deleteTemplateLoading = null
      }
    },
    edit () {
      this.editMode = true
      this.$vuetify.goTo('#container')
    },
    switchPersonType (type) {
      this.clientType = type
    },
    updateTemplate (key, value) {
      if (!this.client.template.hasOwnProperty(key)) {
        this.$set(this.client.template, key, value)
      } else {
        this.client.template[key] = value
      }
    },
    updateValue (key, value) {
      if (!this.client.hasOwnProperty(key)) {
        this.$set(this.client, key, value)
      } else {
        this.client[key] = value
      }
    },
    saveAsTemplate () {
      this.templateSaveDialog = true
    },
    showModalList () {
      this.templateListDialog = true
    },
    restoreTemplate () {
      this.client.template = this.templateCopy || { id: this.client.id }
      this.templateCopy = null
      this.templateListDialog = false
      this.templateChanged = false
    },
    setTemplate (id) {
      this.templateCopy = Object.assign({}, this.client.template)
      const template = this.templates.find(t => t.id === id)
      if (template) {
        let temp = Object.assign({}, template, { id: this.client.template.id })
        delete temp.__typename
        this.client.template = temp
      } else if (id === 'default') {
        this.client.template = { id: this.client.id }
      }
      this.templateChanged = true
    },
  },
}
</script>

<style lang="postcss" scoped>
  .header {
    @apply mb-3 text-sm items-center;
  }
  .header__title {
    font-size: 24px;
    @apply mb-6 block font-bold text-center text-gray-lighter;
  }
  .header__actions {
    @apply flex flex-col justify-around items-center;
  }
  .card__radio-group {
    display: flex;
    margin-top: 60px;
    margin-left: 30px;
  }
  .card__add-address-btn {
    height: 26px;
    margin-left: -30px;
    @apply flex justify-start items-center;
    @apply pl-1 pr-6;
    @apply border rounded-full text-sm;
  }
  .back-to-list-btn {
    @apply flex items-center;
    @apply py-2 pl-3 pr-6 mx-auto mt-20;
    @apply border rounded-full text-sm;
  }
  .back-to-list-btn:focus {
    @apply outline-none;
  }
  .template-card {
    display: none;
  }
  .template-card__triangle {
    width: 0;
    height: 0;
  }

  @screen md {
    .header {
      @apply flex;
    }
    .header__title {
      @apply mr-2 mb-0 inline text-base font-normal;
    }
    .header__actions {
      @apply flex-row justify-start;
    }
    .card__radio-group {
      display: none;
    }
    .card__add-address-btn {
      margin-left: 0;
    }
    .back-to-list-btn {
      @apply flex items-center;
      @apply py-2 pl-3 pr-6 mx-0 mt-6;
      @apply border rounded-full text-sm;
    }
    .template-card {
      display: block;
    }
    .template-card__triangle {
      width: 14px;
      height: 14px;
      transform: rotate(45deg);
      background-color: #0F0F0F;
      position: absolute;
      top: -7px;
      left: 95px;
    }
  }

  @screen lg {
    .header__actions {
      width: 33%;
    }
  }
</style>
