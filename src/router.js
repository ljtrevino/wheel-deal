import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

export default new VueRouter({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./views/Home.vue')
    },
    {
      path: "/account",
      name: 'Account',
      component: () => import('./views/Account.vue')
    },
    {
      path: "/listing",
      name: "Listing",
      component: () => import('./views/Listing.vue'),
      props: true,
    }
  ]
})
