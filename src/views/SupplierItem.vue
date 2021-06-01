<template>
  <SupplierCard
    ref="card"
    :org-id="$route.params.orgId"
    :create="create"
  />
</template>

<script>
import SupplierCard from '../components/SupplierCard.vue'

export default {
  name: 'SupplierItem',
  components: {
    SupplierCard,
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
