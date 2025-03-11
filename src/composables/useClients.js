import { ref } from 'vue'
import { useAPI } from './useAPI'
import { useAuth } from './useAuth'
import { waitUntil } from 'async-wait-until'
import { useRoute } from 'vue-router'
const clients = ref([])

export function useClients() {
    const route = useRoute()
    const api = useAPI()
    const { user } = useAuth()

    function fetchClients() {
        return new Promise(async (resolve) => {
            // filter[users][directus_users_id][_eq]=$CURRENT_USER&fields=*
            let url = `clients?populate[logo]=url&sort[0]=id:asc`

            if (user.value.user.clients.length > 0) {
                user.value.user.clients.forEach((cli, i) => {
                    url += `&filters[id][$in][${i}]=${cli.id}`
                })
            }

            const res = await api.get(url)

            const _clients = res.data.data.map(obj => {
                return {
                    ...obj,
                    camera: {
                        count: 0,
                        loading: true,
                    },
                    vehicle: {
                        count: 0,
                        loading: true,
                    },
                    detection: {
                        count: 0,
                        loading: true,
                    },
                }
            })
            clients.value = _clients
            resolve()
        })
    }

    function fetchSelectedProject() {
        return new Promise(async (resolve) => {
            await waitUntil(() => projects.value.length > 0)
            resolve(projects.value.find((project) => project.slug === route.params.slug))
        })
    }

    return {
        clients,
        fetchClients,
        // fetchSelectedProject
    }
}

