<template>
  <div class="content">
    <StatusBar></StatusBar>
    <section>
      <div class="container">
        <div class="flex flex-col">
          <Button
            outline
            secondary
            class="mx-auto sm:mr-0 mt-8 mb-24 md:mb-0 flex justify-center sm:justify-end"
            @click="$router.push({name: 'signin'})"
          >
            <template v-slot:text>
              <span>{{ $t('welcome.hasAccount') }}</span>
            </template>
            <span>{{ $t('action.login') }}</span>
          </Button>
          <div class="mb-8 md:mb-32">
            <div class="w-full flex-grow">
              <h1 class="headline mb-12">
                <span>
                  {{ $t('welcome.congrats') }}
                </span>
                <span>
                  {{ $t('welcome.successRegister') }}
                </span>
              </h1>
              <div class="form--max-w-md bg-accent1 py-5 md:px-8 md:-ml-8 rounded md:shadow-md">
                <p class="text-gray-lightest md:text-white mb-4">
                  {{ $t('welcome.confirmRegistration') }}&nbsp;—&nbsp;
                  <span class="text-white sm:inline block">
                    {{ $t('welcome.followTheLink') }}
                  </span>
                </p>
                <p v-if="username">
                  <span class="text-white">
                    {{ $t('welcome.emailNotRecieved') }}
                  </span>&nbsp;
                  <Button
                    text
                    secondary
                    class="inline-block"
                    @click.prevent="resendSignUp"
                  >
                    <span>{{ $t('action.resend') }}</span>
                  </Button>
                </p>
              </div>
            </div>
          </div>
          <div class="mt-16">
            <Social />
          </div>
        </div>
      </div>
    </section>
    <Copyright />
    <div class="content-background content-background--main" />
  </div>
</template>

<script>
import StatusBar from '@/components/StatusBar.vue'
import Social from '@/components/Social.vue'
import Copyright from '@/components/Copyright.vue'

export default {
  name: 'Welcome',
  components: {
    StatusBar,
    Social,
    Copyright,
  },
  data () {
    return {
      hasRegisteredUsername: false,
      loading: false,
      errorMessage: '',
      showPassword: false,
      username: null,
    }
  },
  mounted () {
    // check registered user username from session storage
    // show resend button if exist
    this.username = sessionStorage.getItem('Cognito-registered-username')
  },
  methods: {
    async resendSignUp () {
      try {
        if (!this.username) return
        await this.$Auth.resendSignUp(this.username)
        this.$notify({ color: 'green', text: this.$t('message.emailResent'), timeout: 10000 })
      } catch (error) {
        this.$notify({ color: 'orange', text: this.$t('message.failedToSent'), timeout: 10000 })
        this.$logger.warn('Error: ', error)
      }
    },
  },
}
</script>
