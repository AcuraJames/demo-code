import Vue from 'vue'
import VueApollo from 'vue-apollo'
import { ApolloClient } from 'apollo-client'
import { ApolloLink, split } from 'apollo-link'
import { createHttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context'
import { onError } from 'apollo-link-error'
import { WebSocketLink } from 'apollo-link-ws'
import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory'
import { getMainDefinition } from 'apollo-utilities'
import { typeDefs, resolvers } from '../../graphql'
import { GET_BACKEND_VERSION } from '../../graphql/queries'
import { BACKEND_VERSION_HEADER_KEY } from '../../config/globals'
import { Auth, Logger } from '../index'
import router from '../../router'

const logger = new Logger('Apollo')

// hardcoded TODO with https://www.apollographql.com/docs/react/data/fragments/#fragments-on-unions-and-interfaces
const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: {
    __schema: {
      types: [
        {
          kind: 'UNION',
          name: 'SpecDeltaObject',
          possibleTypes: [
            {
              name: 'Spec',
            },
            {
              name: 'Invoice',
            },
            {
              name: 'Product',
            },
            {
              name: 'PayloadFields',
            },
          ],
        },
      ],
    },
  },
})

const cache = new InMemoryCache({ fragmentMatcher })

const authLink = setContext(async (request, { headers }) => {
  const session = await Auth.currentSession()
  const token = session.getIdToken().getJwtToken()
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `${token}` : '',
    },
  }
})

const reponseHeaders = new ApolloLink((operation, forward) => {
  return forward(operation).map(response => {
    const context = operation.getContext()
    const {
      response: { headers },
    } = context
    if (headers) {
      const backendVersion = headers.get(BACKEND_VERSION_HEADER_KEY)
      if (backendVersion) {
        apolloClient.writeQuery({
          query: GET_BACKEND_VERSION,
          data: {
            backendVersion,
          },
        })
      }
    }
    return response
  })
})

// HTTP connection to the API
const httpLink = createHttpLink({
  // You should use an absolute URL here
  uri: process.env.VUE_APP_GRAPHQL_ENDPOINT,
})

// Create the subscription websocket link
const wsLink = new WebSocketLink({
  uri: process.env.VUE_APP_GRAPHQL_WS_ENDPOINT,
  options: {
    reconnect: true,
    lazy: true,
    connectionParams: async () => {
      const session = await Auth.currentSession()
      const token = session.getIdToken().getJwtToken()
      return {
        authToken: token || '',
      }
    },
  },
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      const { message, locations, path, extensions } = err
      const code = extensions && extensions.code
      switch (code) {
        case 'UNAUTHENTICATED':
          // error code is set to UNAUTHENTICATED
          // when AuthenticationError thrown in resolver
          cache.reset()
          Auth.signOut()
          router.push({
            name: 'signin',
            query: router.currentRoute.fullPath && router.currentRoute.fullPath !== '/'
              ? { redirect: router.currentRoute.fullPath } : {},
          })
          break
        default:
          logger.warn(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          )
          if (message && message.includes('Forbidden')) {
            router.app.$notify({ color: 'orange', text: 'Forbidden' })
          }
      }
    }
  }
  if (networkError) {
    logger.warn(`[Network error]: ${networkError}`)
  }
})

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
  },
  wsLink,
  authLink.concat(reponseHeaders.concat(httpLink)),
)

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, link]),
  cache,
  typeDefs,
  resolvers,
  connectToDevTools: true,
})

const data = {
  isLoggedIn: false,
  isSpecSync: false,
  loggedInUser: null,
}

cache.writeData({ data })
apolloClient.onResetStore(() => cache.writeData({ data }))

Vue.use(VueApollo)

const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})

export default apolloProvider
