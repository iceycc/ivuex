import {applyMixin} from './mixin'
import ModuleCollection from "@/vuex/module-collection";
import {forEachValue} from "@/vuex/utils";

let Vue;

// 每次派发最新数据的时候，获取store的path的最新state状态去更新。因为replaceState会强制改变state
function getState(store, path) {
    // return module.state
    return path.reduce((rootState, current) => {
        return rootState[current]
    }, store.state)
}

function installModule(store, path, module, rootState) {
    let namespaced = store._modules.getNamespace(path)
    // state
    // 状态：需要将子模块的状态定义到根模块上
    if (path.length > 0) { // 是子模块
        // 需要将子模块的状态定义到父模块上
        // ['a'] ['a','c']
        let parent = path.slice(0, -1).reduce((memo, current) => {
            return memo[current];
        }, rootState)
        store._withCommitting(() => {
            // 新增属性需要手动set设置响应式
            Vue.set(parent, path[path.length - 1], module.state); // 第一次初始化state数据，增加数据劫持
            // parent[path[path.length - 1]] = module.state // 这样不是响应式到
        })
    }

    // mutations和actions
    //      module._raw.mutations
    //      module._raw.actions
    module.forEachMutations((mutation, key) => {
        store.mutations[namespaced + key] = (store.mutations[namespaced + key] || []);
        //  getState(store, path) 每次调用的时候获取最新的state
        store.mutations[namespaced + key].push((payload) => mutation.call(store, getState(store, path), payload))
    })

    module.forEachActions((action, key) => {
        store.actions[namespaced + key] = (store.actions[namespaced + key] || []);
        store.actions[namespaced + key].push((payload) => action.call(store, store, payload))
    })

    // getters
    module.forEachGetters((getter, key) => {

        store.warpGetters[key] = () => getter.call(store, getState(store, path))
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

        if (store.strict) {
            store._vm.$watch(() => store._vm._data.$$state, () => {
                console.assert(store._committing, '在mutations之外修改了数据')
            }, {sync: true, deep: true})
        }

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
        this.subscribes = [] // 存储subscribe回调函数，用于发布订阅
        // 严格模式
        this.strict = options.strict;
        this._committing = false;
        this._withCommitting = function (fn) {
            let committing = this._committing;
            this._committing = true;
            fn() // 如果是异步的话，
            this._committing = committing;
        }
        let state = options.state; // 存放用户state
        // 安装模块
        installModule(this, [], this._modules.root, state) // 根据模块进行收集
        resetStoreVM(this, state) // 设置实例

        // vue plugin插件相关
        // 默认创建vuex实例时，会自上而下自动执行
        options.plugins.forEach(plugin => {
            plugin(this)
        })
    }

    subscribe(fn) {
        // 订阅函数，状态改变就需要执行
        this.subscribes.push(fn)
    }

    replaceState = (newState) => {
        this._withCommitting(() => {
            // 虽然改变了状态，但是内部代码用的还是老状态
            this._vm._data.$$state = newState
        })
    }

    get state() { // 属性访问器 this.$store.state  Object.defineProperty
        return this._vm._data.$$state
    }

    commit = (type, payload) => {
        if (this.mutations[type]) {
            this._withCommitting(() => {
                // commit后，mutations后 状态就更新了
                this.mutations[type].forEach(fn => fn(payload))
            })
            // 通知subscribe状态更新了
            this.subscribes.forEach(fn => fn({type, payload}, this.state));
        }
    }
    dispatch = (type, payload) => {
        if (this.actions[type]) {
            this.actions[type].forEach(fn => fn(payload))
        }
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


