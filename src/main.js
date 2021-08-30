import Vue from 'vue'
import App from './App.vue'
import store from './store'

Vue.config.productionTip = false

// 注入vue-router后所有组件都可以获取到_router $router
// 注入的store，所有组件都可以获取到$store
new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
