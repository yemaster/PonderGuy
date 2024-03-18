import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.min.js"
import './assets/main.css'

const pinia = createPinia()
const app = createApp(App)

if ((window as any)?.injectFunctions) {
    app.config.globalProperties.$injectFunc = (window as any).injectFunctions
}
else {
    import("@/base/inject").then(module => {
        app.config.globalProperties.$injectFunc = module.default
    }).catch(err => {
        alert("Fatal Error: Cannot import inject functions")
    })
}

app.use(router)
    .use(pinia)

app.mount('#app')
