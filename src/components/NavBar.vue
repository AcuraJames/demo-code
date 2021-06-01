<template>
  <div class="navbar container container--sm">
    <router-link
      :to="{
        name: 'specs',
        params: { orgId },
      }"
      :class="{ active: $route.name == 'spec' }"
    >
      <div class="navbar__link">
        <Icon
          v-if="$route.name == 'spec'"
          :class="[
            'mr-2',
            {'-ml-2': $route.name == 'spec'}
          ]"
        >
          {{ icons.mdiArrowLeft }}
        </Icon>
        {{ $t('navbar.deals') }}
      </div>
    </router-link>
    <router-link
      v-if="roleInOrg === 'OWNER' || roleInOrg === 'MANAGER'"
      :to="{
        name: 'clients',
        params: { orgId },
      }"
      :class="{ active: $route.name == 'client' || $route.name == 'client-create' }"
    >
      <div class="navbar__link">
        <Icon
          v-if="$route.name == 'client' ||
          $route.name == 'client-create'"
          :class="[
            'mr-2',
            {'-ml-2': $route.name == 'client' || $route.name == 'client-create'}
          ]"
        >
          {{ icons.mdiArrowLeft }}
        </Icon>
        {{ $t('navbar.clients') }}
      </div>
    </router-link>
    <router-link
      v-if="roleInOrg === 'OWNER' || roleInOrg === 'MANAGER'"
      :to="{
        name: 'suppliers',
        params: { orgId },
      }"
      :class="{ active: $route.name == 'supplier' ||
      $route.name == 'supplier-create' }"
    >
      <div class="navbar__link">
        <Icon
          v-if="$route.name == 'supplier' ||
          $route.name == 'supplier-create'"
          :class="[
            'mr-2',
            {'-ml-2': $route.name == 'supplier' || $route.name == 'supplier-create'}
          ]"
        >
          {{ icons.mdiArrowLeft }}
        </Icon>
        {{ $t('navbar.suppliers') }}
      </div>
    </router-link>
    <router-link
      v-if="roleInOrg === 'OWNER' || roleInOrg === 'MANAGER'"
      :to="{
        name: 'requisites',
      }"
      :class="{ active: $route.name == 'requisite' || $route.name == 'requisite-create' }"
    >
      <div class="navbar__link">
        <Icon
          v-if="$route.name == 'requisite' ||
          $route.name == 'requisite-create'"
          :class="[
            'mr-2',
            {'-ml-2': $route.name == 'requisite' || $route.name == 'requisite-create'}
          ]"
        >
          {{ icons.mdiArrowLeft }}
        </Icon>
        {{ $t('requisites.requisites') }}
      </div>
    </router-link>
    <router-link
      v-if="roleInOrg === Role.OWNER"
      :to="{
        name: 'staff',
        params: { orgId },
      }"
    >
      <div class="navbar__link">
        {{ $t('navbar.staff') }}
      </div>
    </router-link>
  </div>
</template>

<script>
import { mdiArrowLeft } from '@mdi/js'

import { GET_ORGS } from '../graphql/queries'
import { Role } from '../graphql/enums'

export default {
  name: 'NavBar',
  apollo: {
    getOrgs: {
      query: GET_ORGS,
      fetchPolicy: 'cache-only',
    },
  },
  data () {
    return {
      Role,
      icons: {
        mdiArrowLeft,
      },
    }
  },
  computed: {
    orgId () {
      return this.$route.params.orgId
    },
    roleInOrg () {
      const orgs = this.getOrgs || []
      const org = orgs.find(el => el.id === this.orgId) || {}
      return org.role || null
    },
  },
}
</script>

<style>
.navbar {
  display: flex;
  padding-top: 40px;
  overflow-x: auto;
}
.navbar__link {
  white-space: nowrap;
  padding: 5px 20px;
  display: flex;
  align-items: center;
  font-weight: 600;
}
.navbar > a.router-link-exact-active,
.navbar > a.router-link-active.active {
  border: 1px solid #aaaaaa;
  border-radius: 9999px;
  position: relative;
}
</style>
