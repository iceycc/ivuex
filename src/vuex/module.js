import {forEachValue} from "@/vuex/utils";

export default class Module {
    constructor(rawModule) {
        this._raw = rawModule;
        this._children = [];
        this.state = rawModule.state;
    }

    getChild(key) {
        return this._children[key];
    }

    get namespaced() {
        return this._raw.namespaced
    }

    addChild(key, module) {
        this._children[key] = module
    }

    forEachMutations(cb) {
        if (this._raw.mutations) {
            forEachValue(this._raw.mutations, cb)
        }
    }

    forEachActions(cb) {
        if (this._raw.actions) {
            forEachValue(this._raw.actions, cb)
        }
    }

    forEachGetters(cb) {
        if (this._raw.getters) {
            forEachValue(this._raw.getters, cb)
        }
    }

    forEachChildren(cb) {
        forEachValue(this._children, cb)
    }
}
