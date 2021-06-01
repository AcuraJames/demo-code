<template>
  <div class="content">
    <div class="bg-white md:bg-accent1">
      <div class="container">
        <div class="status-bar">
          <div class="status-bar__logo">
            <router-link to="/" class="text-logo-mobile md:text-logo-desktop">
              <svg
                xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 247.8 37.8"
                xml:space="preserve">
                <polygon fill="currentColor" points="33.5,9.7 33.5,0.9 0.9,0.9 0.9,11.3 16.4,11.3 0,29.3 0,37.8 34.7,37.8 34.7,27.4 16.8,27.4 "/>
                <path fill="currentColor" d="M56.8,0c-5.9,0-10.6,1.9-14.1,5.6c-3.6,3.7-5.4,8.3-5.4,13.8c0,5.9,2,10.6,6,14.1c4,3.5,8.9,5.2,14.6,5.2
                  c6.3,0,11.2-1.3,14.7-3.8V25c-3.8,2.1-7.8,3.2-11.8,3.2c-5.3,0-9.7-1.9-10.7-5.7h24.7v-3.2c0-5.7-1.7-10.3-5-13.9
                  C66.3,1.8,62,0,56.8,0z M49.8,15.7c0.5-3.8,3-6.2,6.4-6.2c3.1,0,5.7,2.5,5.8,6.2H49.8z"/>
                <path fill="currentColor" d="M104.7,0c-4.3,0-8,1.7-11.2,5.1V0.9H80.7v36.9h12.8V14.7c1.6-2.2,3.6-3.3,6.2-3.3c3,0,5.3,1.7,5.3,6.1v20.2
                  h12.8V15.2C117.8,5.9,112.9,0,104.7,0z"/>
                <path fill="currentColor" d="M148.4,0.7c-4.9,0-8.9,1.7-12.1,5.3V1.6h-10.2v36.2h10.2V14.7c1.7-2.7,5-4.7,8.2-4.7c3.8,0,6.9,2.1,6.9,7.7
                  v20.1h10.2V15.6C161.6,6.3,156.9,0.7,148.4,0.7z"/>
                <path fill="currentColor" d="M191.7,1.2c-5.2,0-9.6,1.9-13.1,5.7V2.2h-7.8v35.6h7.8V14.4c2-3.3,6.1-5.8,10.1-5.8c4.6,0,8.3,2.2,8.3,9.2
                  v20h7.8V16C205,6.8,200.2,1.2,191.7,1.2z"/>
                <path fill="currentColor" d="M234.1,1.9c-5.7,0-10.3,2.1-14,6.2V2.8h-5.2v35h5.2V14.1c1.2-2,2.9-3.6,5.2-5.1c2.3-1.5,4.6-2.2,7-2.2
                  c4.3,0,9.9,1.6,9.9,10.8v20.2h5.2V16.5C247.5,7.3,242.8,1.9,234.1,1.9z"/>
              </svg>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!--
      TODO Change StatusBar
    -->

    <section class="h-full flex-grow mt-16 flex items-center">
      <div class="container">
        <div>
          <div class="m-auto text-center">
            <div class="text-404">404</div>
            <p class="font-light">
              <span class="inline">{{ $t('message.notFoundStart') }}</span>&nbsp;
              <span class="block md:inline">{{ $t('message.notFoundEnd') }}</span>
            </p>
            <Button
              outline
              secondary
              class="mt-8 mx-auto"
              @click="$router.push({ name: 'home' })"
            >
              <span>{{ $t('action.toHome') }}</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
   </div>
</template>

<script>
export default {
  name: 'NotFound',
}
</script>
