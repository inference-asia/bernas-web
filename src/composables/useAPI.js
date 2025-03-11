import axios from 'axios'
import { useAuth } from '@/composables/useAuth'
import { useRoute } from 'vue-router'
import { watch } from 'vue'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_ENDPOINT
})
api.interceptors.request.use((config) => {
    if (config.url === '/auth/local')
        config.headers.Authorization = null

    return config
}, (err) => {
    return Promise.reject(err)
})

export function useAPI() {
    const { user, logout } = useAuth()
    const route = useRoute()

    if (user.value)
        setBearerToken()

    watch(user, () => {
        setBearerToken()
    })

    function setBearerToken() {
        if (user.value)
            api.defaults.headers.common['Authorization'] = `Bearer ${user.value.jwt}`
        else if (typeof route.query.jwt !== 'undefined')
            api.defaults.headers.common['Authorization'] = `Bearer ${route.query.jwt}`
        else
            api.defaults.headers.common['Authorization'] = null

        api.interceptors.response.use((response) => {
            return response
        }, (err) => {
            if ([401, 403].includes(err.response.status)) {
                logout(() => {
                    window.location = '/#/login'
                })
            }

            return Promise.reject(err)
        })
    }

    return api
}
