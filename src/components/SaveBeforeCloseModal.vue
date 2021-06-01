<template>
  <div class="modal">
    <div class="modal-header">
      <Icon size="28">{{ icons.ziAlert }}</Icon>
      <span class="ml-3">
        {{ title || $t('alert.attention') }}
      </span>
    </div>
    <div class="modal-body text-center text-sm sm:text-left sm:text-base">
      <div class="pb-8">
        <p>
          {{ text }}
        </p>
        <p v-if="postScriptum" class="pt-5">
          {{ postScriptum }}
        </p>
      </div>
      <div class="sm:pb-8 flex flex-col sm:flex-row justify-between items-center text-base">
        <Button
          outline
          width="140"
          class="mb-3 sm:mb-0"
          @click="$emit('dontSave')"
        >
          <span>{{ dontSaveButton || $t('action.dontSave') }}</span>
        </Button>

        <Button
          outline
          width="140"
          class="mb-3 sm:mb-0"
          @click="$emit('cancel')"
        >
          <span>{{ cancelButton || $t('action.cancel') }}</span>
        </Button>

        <Button
          width="140"
          class="mb-3 sm:mb-0"
          @click="$emit('save')"
        >
          <span>{{ saveButton || $t('action.save') }}</span>
        </Button>
      </div>
    </div>
  </div>
</template>

<script>
import { ziAlert } from '@/assets/icons'

export default {
  name: 'SaveBeforeCloseModal',
  props: {
    title: {
      type: String,
      default: '',
    },
    text: {
      type: String,
      default: '',
    },
    postScriptum: {
      type: String,
      default: '',
    },
    dontSaveButton: {
      type: String,
      default: '',
    },
    cancelButton: {
      type: String,
      default: '',
    },
    saveButton: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      icons: {
        ziAlert,
      },
    }
  },
}
</script>

<style lang="postcss" scoped>
  .modal {
    position: relative;
    @apply bg-gray text-lg;
  }
  .modal-header {
    padding: 15px;
    display: flex;
    align-items: center;
    color: #aaaaaa;
    @apply bg-gray-darkest;
  }
  .modal-body {
    padding: 20px;
    color: #aaaaaa;
  }
  @screen sm {
    .modal-header {padding: 25px;}
    .modal-body {padding: 30px 40px;}
  }
</style>
