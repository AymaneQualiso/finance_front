import { createApp } from 'vue'
import App from '@/App.vue'
import { registerPlugins } from '@core/utils/plugins'
import FloatingVue from 'floating-vue'

// Styles
import '@core/scss/template/index.scss'
import '@styles/styles.scss'
import 'floating-vue/dist/style.css'


// Create vue app
const app = createApp(App)


// Register plugins
registerPlugins(app)

// Register floating vue
app.use(FloatingVue)

// Mount vue app
app.mount('#app')
