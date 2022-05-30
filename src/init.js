import { initState } from "./state"

export function initMixin(Vue){ // 给vue增加init方法
  Vue.prototype._init = function(options){ // 初始化操作
    const vm = this
    vm.$options = options
    // 初始化状态
    initState(vm)
  }
}

