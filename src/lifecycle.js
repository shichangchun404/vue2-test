import {
  createElementVNode,
  createTextVNode
} from "./vnode"
import Watcher from "./observe/watcher"
import { patch } from "./vnode/patch"

export function initLifeCycle(Vue) {
  Vue.prototype._update = function (vnode) { // 将vnode转换成真实dom 替换el
    const vm = this
    // 既有初始化 又有更新的功能
    // vm.$el = patch(vm.$el, vnode)

    const preVnode = vm._vnode
    vm._vnode = vnode
    if(preVnode){
      vm.$el = patch(preVnode, vnode)
    } else {
      vm.$el = patch(vm.$el, vnode)
    }
   

  }
  Vue.prototype._render = function () {
    const vm = this
    // 渲染时 会去实例中取值 将视图与属性绑定在一起
    return vm.$options.render.call(vm)
  }
  // _c('div',{}, ...children)
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments)
  }
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments)

  }
  Vue.prototype._s = function (value) {
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }
    return value
  }
}


export function mountComponent(vm, el) {

  vm.$el = el // 此处el是通过querySelector(el)获取的结果 是真实dom 不是$options.el
  // 1 调用render函数 产生虚拟节点 虚拟DOM
  // let vnode = vm._render() // vm.$options.render 我们自己生成的render函数 生成虚拟节点
  // console.log('vnode ', vnode)
  // 2 根据虚拟DOM 产生真是DOM
  // vm._update(vnode)

  // 以上代码通过回调函数 封装给watcher
  const updateComponent = () =>{
    vm._update(vm._render())
  }

  const watcher = new Watcher(vm, updateComponent, true) // 参数true 表示一个渲染watcher

  // console.log(watcher)


}

export function callHook(vm, hook){
  const handlers = vm.$options[hook]
  if(handlers){
    handlers.forEach(handler => {
      handler.call(vm)
    })
  }
}