<template>
  <div id="app">
    <ul>
      <li>我的姓名:{{ $store.state.name }}</li>
      <li>我的年龄:{{ $store.state.age }}</li>
      <li>十年后我的年龄：{{ $store.getters.myAge }}</li>
      <li>年龄同步+1
        <button @click="$store.commit('changeAge',1)">+1</button>
      </li>
      <li>年龄异步+2
        <button @click="$store.dispatch('changeAge',2)">+1</button>
      </li>
      <li>-----------模块 a -----------</li>
      <li>
        a: {{ $store.state.a.name }} --- {{ $store.state.a.age }}
      </li>
      <li>年龄同步+1
        <button @click="$store.commit('a/changeAge',1)">+1</button>
      </li>
      <li>-----------模块 b -----------</li>
      <li>
        b: {{ $store.state.b.name }} ---{{ $store.state.b.age }}
      </li>
      <li>年龄同步+1
        <button @click="$store.commit('b/changeAge',1)">+1</button>
      </li>
    </ul>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {},
  created() {

  }
}
</script>

