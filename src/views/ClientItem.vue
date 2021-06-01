<template>
  <ClientCard
    ref="card"
    :org-id="$route.params.orgId"
    :create="create"
  />
</template>

<script>
import ClientCard from '../components/ClientCard.vue'

export default {
  name: 'ClientItem',
  components: {
    ClientCard,
  },
  props: {
    create: {
      type: Boolean,
      default: false,
    },
  },
  async beforeRouteLeave (to, from, next) {
    await this.$refs.card.checkChangesBeforeLeave(next)
  },
}
</script>
