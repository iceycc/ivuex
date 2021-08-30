import {applyMixin} from './mixin'
import ModuleCollection from "@/vuex/module-collection";
import {forEachValue} from "@/vuex/utils";

let Vue;

function installModule(store, path, module, rootState) {
    // state
    // 状态：需要将子模块的状态定义到根模块上
    if (path.length > 0) { // 是子模块
        // 需要将子模块的状态定义到父模块上
        // ['a'] ['a','c']
        let parent = path.slice(0, -1).reduce((memo, current) => {
            return memo[current];
        }, rootState)
        // 新增属性需要手动set设置响应式
        Vue.set(parent, path[path.length - 1], module.state);
        // parent[path[path.length - 1]] = module.state // 这样不是响应式到
    }

    // mutations和actions
    //      module._raw.mutations
    //      module._raw.actions
    module.forEachMutations((mutation, key) => {
        store.mutations[key] = (store.mutations[key] || []);
        store.mutations[key].push((payload) => mutation.call(store, module.state, payload))
    })

    module.forEachActions((action, key) => {
        store.actions[key] = (store.actions[key] || []);
        store.actions[key].push((payload) => action.call(store, store, payload))
    })

    // getters
    module.forEachGetters((getter, key) => {
        store.warpGetters[key] = () => getter.call(store, module.state)
    })


    // 递归安装
    module.forEachChildren((childModule, key) => {
        installModule(store, path.concat(key), childModule, rootState)
    })
}

function resetStoreVM(store, state) {
    let computed = {}
    forEachValue(store.warpGetters, (fn, key) => {
        computed[key] = fn
        Object.defineProperty(store.getters, key, {
            get: () => store._vm[key]
        })

        store._vm = new Vue({
            data: {
                //  state
                $$state: state // 会将options.state也变成响应式了
            },
            computed
        })

    })
}

// 模块的收集
export class Store {

    constructor(options) {
        // 1、用户可能会有嵌套的module
        // 2、类似router -》 routers -》 routerMap
        // 3、options -》 格式化成一个树
        this._modules = new ModuleCollection(options)
        // actions
        this.actions = {} // 不开启namespace时,将用户所有模块的actions都放到这个对象
        // mutations
        this.mutations = {} //  不开启namespace时,将用户所有模块的mutations都放到这个对象
        // getters
        this.getters = {}
        this.warpGetters = {} // 存放所有getters
        let state = options.state; // 存放用户state
        // 安装模块
        installModule(this, [], this._modules.root, state) // 根据模块进行收集
        resetStoreVM(this, state) // 设置实例
        console.log(this.state)
        console.log(this.getters)
        console.log(this.mutations)
        console.log(this.actions)
    }

    get state() { // 属性访问器 this.$store.state  Object.defineProperty
        return this._vm._data.$$state
    }

    commit = (type, payload) => {
        this.mutations[type] && this.mutations[type].forEach(fn => fn(payload))
    }
    dispatch = (type, payload) => {
        this.actions[type] && this.actions[type].forEach(fn => fn(payload))
    }
}

// 将用户的配置格式化成一颗树：
/*
 let root = {
    _raw: {state, mutation, getters, actions},
    _children: {
        a: {
            _raw: {state, mutation, getters, actions},
            state: {},
            _children: {
                c: {
                    _raw: {state, mutation, getters, actions},
                },
                state: {},
            }
        },
        b: {
            _raw: {state, mutation, getters, actions},
            state: {}
        }
    },
    rootState: {}
}
 */

export const
    install = function (_Vue) {
        Vue = _Vue
        applyMixin(Vue)
    }


