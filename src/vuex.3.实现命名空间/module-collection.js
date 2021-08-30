import {forEachValue} from "@/vuex/utils";
import Module from './module'


export default class ModuleCollection {
    constructor(options) {
        this.root = null;
        // 生成树
        // 遍历用户的属性对数据进行格式化
        this.register([], options);
    }

    getNamespace(path) { // ['a']  ['a','b'] ['a','b','c']
        let module = this.root;
        return path.reduce((namespace, key) => {
            module = module.getChild(key)
            return namespace + (module.namespaced ? key + '/' : '')
        }, '')
    }

    register(path, rootModule) {
        // 根据用户配置创建树节点
        let newModule = new Module(rootModule)
        // let newModule = {
        //     _raw: rootModule,
        //     _children: {},
        //     state: rootModule.state
        // }
        // 注册根
        if (path.length === 0) {
            // [root]
            this.root = newModule;
        } else {
            // 需要将当前模块定义到父亲上
            // [root,a] [root,a,b]
            //          [root,a,c] [root,a,c,d]
            // 截取最后一项，返回新数组。
            let parent = path.slice(0, -1).reduce((memo, current) => {
                // 一层层往下找，返回d的父节点
                // 获取一个孩子
                return memo.getChild(current)
                // return memo._children[current]
            }, this.root)
            // 增加一个孩子
            parent.addChild(path[path.length - 1], newModule)
            // parent._children[path[path.length - 1]] = newModule
        }
        // root._children[a] = {_children:{b:{},c:{_children:{d:{}}}}}
        // 注册模块
        if (rootModule.modules) {
            forEachValue(rootModule.modules, (module, moduleName) => {
                // 递归树
                this.register(path.concat(moduleName), module)
            })
        }
        return
    }
}

// 类比 vue-router ：
// 创建路由createRouterMap（）
// 动态新增路由：addRoute

//  vuex
// 创建树
// 动态注册其他模块
