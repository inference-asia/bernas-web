import '@popperjs/core'
import 'bootstrap'
import './assets/style.scss'
import 'video.js/dist/video-js.css'
import 'mapbox-gl/dist/mapbox-gl.css'
import 'v-calendar/dist/style.css'

import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { setupCalendar } from 'v-calendar'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTv, faCode, faUserCircle, faLocationArrow, faArrowRightToBracket, faSpinner, faBars, faMapMarkerAlt, faCarAlt, faCircleInfo, faArrowRightLong, faMagnifyingGlass, faCircleXmark, faVideo, faHashtag, faGear, faCar, faTriangleExclamation, faXmark, faSun, faMoon, faArrowLeft, faCamera, faCrosshairs, faGripHorizontal, faChartColumn, faPlus, faClock, faMapLocationDot, faHouse, faCalendarDays, faFileUpload, faTrash, faCircleCheck, faScaleBalanced, faDownload, faList, faIdCard, faUser } from '@fortawesome/free-solid-svg-icons'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

import VueChartkick from 'vue-chartkick'
import 'chartkick/chart.js'

library.add(faTv)
library.add(faCode)
library.add(faUserCircle)
library.add(faLocationArrow)
library.add(faArrowRightToBracket)
library.add(faSpinner)
library.add(faBars)
library.add(faCode)
library.add(faMapMarkerAlt)
library.add(faCarAlt)
library.add(faCircleInfo)
library.add(faArrowRightLong)
library.add(faMagnifyingGlass)
library.add(faCircleXmark)
library.add(faVideo)
library.add(faHashtag)
library.add(faGear)
library.add(faCar)
library.add(faTriangleExclamation)
library.add(faXmark)
library.add(faSun)
library.add(faMoon)
library.add(faArrowLeft)
library.add(faCamera)
library.add(faCrosshairs)
library.add(faGripHorizontal)
library.add(faChartColumn)
library.add(faPlus)
library.add(faClock)
library.add(faMapLocationDot)
library.add(faHouse)
library.add(faCalendarDays)
library.add(faFileUpload)
library.add(faTrash)
library.add(faCircleCheck)
library.add(faScaleBalanced)
library.add(faDownload)
library.add(faList)
library.add(faIdCard)
library.add(faUser)

const app = createApp(App)
app.component('v-select', VueSelect)
app.component('VueDatePicker', VueDatePicker);
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(setupCalendar, {})
app.use(VueChartkick)
app.use(router)
app.mount('#app')
