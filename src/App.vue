<template>
  <!-- [data-app] for vuetify components -->
  <div data-app="true" id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app',
  metaInfo () {
    return {
      htmlAttrs: {
        lang: this.$i18n.locale,
      },
    }
  },
  methods: {
    logout () {
      this.$apollo.provider.defaultClient.store.reset()
      this.$Auth.signOut()
      this.$router.push({ name: 'signin' })
    },
  },
}
</script>

<style>
.simple-rotation-anim {
  animation-name: simple-rotation;
  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

@keyframes simple-rotation {
  from { transform: rotate(0deg); }
  to { transform: rotate(359deg); }
}
</style>
