import Vue from 'vue'
import App from './App.vue'
import router from './router'
import * as VueGoogleMaps from 'vue2-google-maps'

Vue.use(VueGoogleMaps, {
  load: {
    key: '<INSERT GOOGLE MAPS KEY HERE>',
    libraries: 'places', // This is required if you use the Autocomplete plugin
    //// If you want to set the version, you can do so:
    // v: '3.26',
  },
  autobindAllEvents: false,
  installComponents: true,
})

export const eventBus = new Vue();

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
