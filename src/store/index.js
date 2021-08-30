import Vue from 'vue'
// import Vuex from 'vuex'
import Vuex from '@/vuex'
// import logger from 'vuex/dist/logger'
// import VuexPersistence from 'vuex-persist'

//  插件vuex-persist: vuex持久化
class VuexPersistence {
    constructor({storage, key}) {
        this.storage = storage;
        this.loaclName = 'my' + key
    }

    plugin = (store) => {
        let localState = JSON.parse(this.storage.getItem(this.loaclName))
        if (localState) {
            store.replaceState(localState)
        }
        store.subscribe((mutation, state) => {
            this.storage.setItem(this.loaclName, JSON.stringify(state))
        })
    }
}

const vuexLocal = new VuexPersistence({
    storage: window.localStorage,
    key: 'vuex'
})
// 插件 logger
const logger = () => (store) => {
    let preState = store.state;
    // 监听变化，每次变化都会执行
    store.subscribe(({type, payload}, state) => {
        console.log('prev ', JSON.stringify(getState(type, preState)))
        console.log(type, payload)
        console.log('next ', JSON.stringify(getState(type, state)))
        preState = JSON.parse(JSON.stringify(state))
    })

    function getState(path, state) {
        // let key = path.replace(/\//g, '.')
        let key = path.split('/').slice(0, -1).join('.')
        return state[key] ? state[key] : state
    }
}


// // Vue.use安装插件原理-》会执行vue插件的install
// Vue.use = function(plugins,options){
//     plugins.install(options)
// }
// Vue.use会默认调用传人插件的install
Vue.use(Vuex)
export default new Vuex.Store({
    strict: true,
    // 插件从上到下执行
    plugins: [
        vuexLocal.plugin, // 默认会先执行一次
        // logger()
    ],
    state: {
        name: 'wby',
        age: 25,
        a: { //  父模块属性和子模块名相同，会被子模块覆盖
            name: 'xxxx'
        }
    },
    getters: {
        // computed属性
        myAge: (state) => state.age + 10
    },
    mutations: {
        //  同步
        changeAge(state, payload) {
            // setTimeout(() => {
                state.age = state.age + payload
            // })
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
    modules: {
        a: {
            namespaced: true,
            state: {
                name: 'wby-a',
                age: 10
            },
            mutations: {
                //  同步
                changeAge(state, payload) {
                    state.age = state.age + payload
                }
            },
            modules: {
                b: {
                    namespaced: true,
                    state: {
                        name: 'wby-b',
                        age: 5
                    },
                    mutations: {
                        //  同步
                        changeAge(state, payload) {
                            state.age = state.age + payload
                        }
                    }
                },
                c: {
                    state: {
                        name: 'wby-c'
                    },
                    modules: {
                        namespaced: true,
                        d: {
                            state: {
                                name: 'wby-d'
                            }
                        }
                    }
                }
            }
        },
        e: {
            namespaced: true,
            state: {
                name: 'wby-e',
                age: 3
            },


        }
    }
})
