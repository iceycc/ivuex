import Vue from 'vue'
import Vuex from 'vuex'
// import Vuex from '@/vuex'

// Vue.use = function(plugins,options){
//     plugins.install(options)
// }
// Vue.use会默认调用传人插件的install
Vue.use(Vuex)

export default new Vuex.Store({
    strict:true,
    state: {
        name: 'wby',
        age: 25
    },
    getters: {
        // computed属性
        myAge: (state) => state.age + 10
    },
    mutations: {
        //  同步
        changeAge(state, payload) {
            state.age = state.age + payload
            // 其实也可以异步操作，只是严格模式下会提示错误
            // setTimeout(() =>{
            //     state.age = state.age + payload
            // },500)
        }
    },
    actions: {
        // 异步 获取数据
        changeAge({commit}, payload) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    commit('changeAge', payload)
                    resolve('change success')
                }, 1000)
            })
        }
    },
    modules: {}
})
