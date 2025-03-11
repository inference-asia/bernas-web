import { onMounted, ref, watch } from 'vue'
import { useAPI } from './useAPI'
import { useRoute } from 'vue-router'
import axios from 'axios'

const user = ref(parser())
// const api = useAPI()

function parser() {
    if (localStorage.getItem('user'))
        return JSON.parse(localStorage.getItem('user'))
    else
        return null
}

export function useAuth() {   
    // const api = useAPI()
    
    // const route = useRoute()

    watch(user, () => {
        if (user.value)
            localStorage.setItem('user', JSON.stringify(user.value))
        else
            localStorage.removeItem('user')
    }, { deep: true })

    function logout(callback) {
        user.value = null
        callback()
    }

    async function fetchMe(){
        let config = {
            headers: {
              'Authorization': 'Bearer ' + user.value.jwt
            }
      
          }
      
        const resMe = await axios.get('https://bernas-api.selgem.com/api/users/me?populate[clients]=*&populate[roles]=*', config)
        let data = user.value
        data.user = resMe.data
        user.value = data
    }

    // onMounted(async () => {
        // const res = await api.get('/users/me')
        // user.value = res.data.data        
    // })

    return { user, fetchMe, logout }
}

