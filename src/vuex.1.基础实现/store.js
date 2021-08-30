import {applyMixin} from './mixin'

let Vue;
const forEachValue = (obj, cb) => {
    Object.keys(obj).forEach(key => cb(obj[key], key))
}

export class Store { // vuex只能vue使用，基于Vue的
    constructor(options) { // this.$store
        const computed = {}
        this.getters = {}
        forEachValue(options.getters, (value, key) => {
            // value是个方法，但是getters获取的是属性不是方法
            computed[key] = () => { // computed是具有缓存的
                // computed里数据不变不会执行
                return value.call(this, this.state)
            }

            Object.defineProperty(this.getters, key, {
                get: () => {
                    // 取值的时候会执行，调用
                    return this._vm[key] // 计算属性也会代理到实例上
                    // 这种方法每次获取都会执行，如果数据不变
                    // return value.call(this, this.state)
                }
            })
        })

        this._vm = new Vue({
            data: { // 整个date或代理到vm._data上
                // 数据响应式
                // 正常内部会进行代理，把所有属性都代理给this._vm,但是这里不需要
                // Vue中$开头的不会被代理到实例上
                $$state: options.state
            },
            computed
        })

        this.mutations = {};
        forEachValue(options.mutations, (value, key) => {
            this.mutations[key] = (payload) => value.call(this, this.state, payload)
        })
        this.actions = {};
        forEachValue(options.actions, (value, key) => {
            this.actions[key] = (payload) => value.call(this, this, payload)
        })
        this.modules = options.modules;
    }

    get state() {
        return this._vm._data.$$state;
    }

    commit = (type, payload) => {
        this.mutations[type](payload)
    }
    dispatch = (type, payload) => {
        this.actions[type](payload)
    }
}

//
;(function (done) {
    if (!done) return

    function Store() {
        let {commit} = this;
        this.commit = () => { // 优先指向构造函数内的方法
            commit.call(this)
        }
    }

    Store.prototype.commit = function () {
        console.log(this)
    }
    let {commit} = new Store()
    commit() // 结构的，原型上的方法会丢失this指向；
})()

export const install = function (_Vue) {
    Vue = _Vue
    applyMixin(Vue)
}


