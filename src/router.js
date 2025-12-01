import { createRouter, createWebHistory } from 'vue-router'
import DailyBroadcast from './pages/DailyBroadcast.vue'
// import Search from './pages/Search.vue'
// import SubjectDetail from './pages/SubjectDetail.vue'
// import SubjectComments from './pages/SubjectComments.vue'
// import Collection from './pages/Collection.vue'
const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', redirect: '/calendar' },
        { path: '/calendar', component: DailyBroadcast },
        // { path: '/search', component: Search },
        // { path: '/subject/:id', component: SubjectDetail },
        // { path: '/subject/:id/comments', component: SubjectComments },
        // { path: '/collection', component: Collection }
    ]
})
export default router