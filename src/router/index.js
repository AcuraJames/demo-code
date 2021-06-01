import Vue from 'vue'
import VueRouter from 'vue-router'

import RequisiteList from '../views/RequisiteList.vue'
import RequisiteItem from '../views/RequisiteItem.vue'
import OrgLayout from '../views/OrgLayout.vue'
import Specs from '../views/Specs.vue'
import Spec from '../views/Spec.vue'
import ClientItem from '../views/ClientItem.vue'
import ClientList from '../views/ClientList.vue'
import SupplierItem from '..//views/SupplierItem.vue'
import SupplierList from '../views/SupplierList.vue'
import Staff from '../views/Staff.vue'
import Preview from '../views/Preview.vue'
import Invitation from '../views/Invitation.vue'
import SignIn from '../views/SignIn.vue'
import Registration from '../views/Registration.vue'
import SignUp from '../views/SignUp.vue'
import Welcome from '../views/Welcome.vue'
import PasswordRestore from '../views/PasswordRestore.vue'
import PasswordRestoreConfirm from '../views/PasswordRestoreConfirm.vue'
import NotFound from '../views/NotFound.vue'

import { Auth, i18n } from '../plugins'
import { apolloClient } from '../plugins/apollo'
import { CHECK_INVITATION, GET_ROLE_IN_PROJECT, GET_ORGS } from '../graphql/queries'

import { CURRENT_ORG_STORE_KEY } from '../config/globals'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: () => {
      const orgId = localStorage.getItem(CURRENT_ORG_STORE_KEY) || ''
      return { name: 'specs', params: { orgId } }
    },
  },
  {
    path: '/z-:orgId',
    meta: { requiresAuth: true },
    component: OrgLayout,
    beforeEnter: async (to, from, next) => {
      try {
        const { data: { getOrgs } } = await apolloClient.query({
          query: GET_ORGS,
          fetchPolicy: 'cache-first',
        })
        if (!getOrgs || getOrgs.length === 0) {
          throw new Error('Not found')
        }
        const orgId = to.params.orgId
        if (!orgId) {
          const [org] = getOrgs
          if (org && org.id) {
            localStorage.setItem(CURRENT_ORG_STORE_KEY, orgId)
            next({ name: 'specs', params: { orgId: org.id } })
          } else {
            throw new Error('Not found')
          }
        } else if (getOrgs.some(el => el.id === orgId)) {
          localStorage.setItem(CURRENT_ORG_STORE_KEY, orgId)
          next()
        } else {
          throw new Error('Not found')
        }
      } catch (error) {
        if (error.message === 'Not found') {
          next('not-found')
        } else {
          next(false)
        }
      }
    },
    children: [
      {
        path: '',
        name: 'specs',
        meta: { requiresAuth: true },
        component: Specs,
      },
      {
        path: 'spec/:specId',
        name: 'spec',
        meta: { requiresAuth: true },
        component: Spec,
        beforeEnter: async (to, from, next) => {
          try {
            const specId = to.params.specId
            const { data: { roleInProject } } = await apolloClient.query({
              query: GET_ROLE_IN_PROJECT,
              variables: {
                specId,
              },
              fetchPolicy: 'network-only',
            })

            if (!roleInProject) {
              throw new Error('No have access!')
            }

            next()
          } catch (error) { // eslint-disable-line
            next(false)
          }
        },
      },
      {
        path: 'clients',
        name: 'clients',
        meta: { requiresAuth: true },
        component: ClientList,
      },
      {
        path: 'clients/create',
        name: 'client-create',
        meta: { requiresAuth: true },
        props: { create: true },
        component: ClientItem,
      },
      {
        path: 'clients/:clientId',
        name: 'client',
        meta: { requiresAuth: true },
        component: ClientItem,
      },
      {
        path: 'suppliers',
        name: 'suppliers',
        meta: { requiresAuth: true },
        component: SupplierList,
      },
      {
        path: 'suppliers/create',
        name: 'supplier-create',
        meta: { requiresAuth: true },
        props: { create: true },
        component: SupplierItem,
      },
      {
        path: 'suppliers/:supplierId',
        name: 'supplier',
        meta: { requiresAuth: true },
        component: SupplierItem,
      },
      {
        path: 'staff',
        name: 'staff',
        meta: { requiresAuth: true },
        component: Staff,
      },
      {
        path: 'requisites',
        name: 'requisites',
        component: RequisiteList,
        meta: { requiresAuth: true },
      },
      {
        path: 'requisites/create',
        name: 'requisite-create',
        meta: { requiresAuth: true },
        props: { create: true },
        component: RequisiteItem,
      },
      {
        path: 'requisites/:reqId',
        name: 'requisite',
        component: RequisiteItem,
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/invitations/:invitationId',
    name: 'invitation',
    component: Invitation,
    beforeEnter: async (to, from, next) => {
      try {
        const id = to.params.invitationId
        if (!id) {
          throw new Error('No valid link')
        }

        const loggedIn = await Auth.checkAuth()
        if (!loggedIn) {
          return next({ name: 'signin', query: { redirect: `/invitations/${id}` } })
        }

        const { data: { checkInvitation } } = await apolloClient.query({
          query: CHECK_INVITATION,
          variables: { id },
          fetchPolicy: 'network-only',
        })

        if (!checkInvitation) {
          throw new Error('No valid link!')
        }

        next()
      } catch (error) {
        router.app.$notify({ color: 'red', text: error.message || '' })
        next('/not-found')
      }
    },
  },
  {
    path: '/spec/:specId/preview',
    name: 'preview',
    meta: { requiresAuth: true },
    component: Preview,
  },
  {
    path: '/signin',
    name: 'signin',
    meta: { requiresNotAuth: true },
    component: SignIn,
  },
  {
    path: '/registration',
    name: 'registration',
    meta: { requiresNotAuth: true },
    component: Registration,
  },
  {
    path: '/signup',
    name: 'signup',
    meta: { requiresNotAuth: true },
    component: SignUp,
  },
  {
    path: '/welcome',
    name: 'welcome',
    meta: { requiresNotAuth: true },
    component: Welcome,
  },
  {
    path: '/email-confirm',
    name: 'email-confirm',
    beforeEnter: (to, from, next) => {
      if (to.query.username) {
        if (to.query.state === 'success') {
          router.app.$notify({ color: 'green', text: i18n.t('message.emailConfirmed') })
        } else if (to.query.state === 'confirmed') {
          router.app.$notify({ color: 'orange', text: i18n.t('message.emailAlreadyConfirmed') })
        } else if (to.query.state === 'error') {
          router.app.$notify({ color: 'red', text: to.query.message })
          // Add message to Analytics
        }
      }
      next('/')
    },
  },
  {
    path: '/password-restore',
    name: 'password-restore',
    meta: { requiresNotAuth: true },
    component: PasswordRestore,
  },
  {
    path: '/password-restore/confirm',
    name: 'password-restore-confirm',
    component: PasswordRestoreConfirm,
    beforeEnter: (to, from, next) => {
      if (to.query.username && to.query.code && to.query.email) {
        next()
      } else {
        // Incorrect request to restore password
        router.app.$notify({ color: 'red', text: i18n.t('message.incorrectRestorePassword') })
        next('/')
      }
    },
  },
  {
    path: '*',
    name: 'not-found',
    component: NotFound,
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach(async (to, from, next) => {
  // check auth
  const loggedIn = await Auth.checkAuth()
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    if (!loggedIn) {
      next({
        name: 'specs',
        query: to.fullPath && to.fullPath !== '/' && to.fullPath !== '/specs'
          ? { redirect: to.fullPath } : {},
      })
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.requiresNotAuth)) {
    if (loggedIn) {
      next({ name: 'home' })
    } else {
      next()
    }
  } else {
    next() // make sure to always call next()!
  }
})

export default router
