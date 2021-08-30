function vuexInit() {
    // 所有组件都可以拿到$store
    if (this.$options.store) {
        this.$store = this.$options.store;
    } else if (this.$parent && this.$parent.$store) {
        this.$store = this.$parent.$store;
    }
}

export function applyMixin(Vue) { // 我需要将store分配给所有的组件
    Vue.mixin({
        beforeCreate: vuexInit
    })
}
