import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useClients } from '@/composables/useClients'

import DefaultLayout from '../layouts/DefaultLayout.vue'
import LoginView from '../views/LoginView.vue'
import LoginLayout from '../layouts/LoginLayout.vue'
import MapView from '@/views/MapView.vue'
import DriverView from '@/views/DriverView.vue'


const { user, fetchMe } = useAuth()
// const { clients, fetchClients } = useClients()

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // {
    //   path: '/main/:id',
    //   name: 'main',
    //   children: [
      
    //   ],
    //   meta: {
    //     requiresAuth: true,
    //     layout: ClientLayout
    //   }
    // },
    {
      path: '/driver',
      name: 'driver',
      component: DriverView,
      meta: {
        requiresAuth: true,
        layout: DefaultLayout
      },
    },
    {
      path: '/',
      name: 'dashboard',
      component: MapView,
      meta: {
        requiresAuth: true,
        layout: DefaultLayout
      },
      beforeEnter: async (to, from, next) => {
        // if (user.value.user.clients.length == 0 || user.value.user.clients.length > 1) {
          next()
        // } else {
        //   next(`/main/${user.value.user.clients[0].id}/map`)
        // }
      },
    },
    {
      path: '/login',
      component: LoginView,
      meta: {
        // requiresAuth: true,
        layout: LoginLayout
      }
    }
  ]
})


router.beforeEach((to, from) => {

  if (to.meta.requiresAuth && user.value === null) {
    let url = '/login'

    if (to.fullPath !== '/') {
      url = url += `?returnUrl=${to.fullPath}`
    }

    return url
  }

  return true
})

export default router
