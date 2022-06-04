import {
  createElementVNode,
  createTextVNode
} from "./vnode"
import Watcher from "./observe/watcher"

export function initLifeCycle(Vue) {

  function createElm(vnode) {
    const {
      vm,
      tag,
      data,
      children,
      text
    } = vnode
    if (typeof tag === 'string') { // 标签
      vnode.el = document.createElement(tag)
      patchProps(vnode.el, data)
      children.forEach(child => { // 递归创建子真实节点 
        vnode.el.appendChild(createElm(child))
      })

    } else [ // 文本
      vnode.el = document.createTextNode(text)
    ]
    return vnode.el // 返回真实节点
  }

  function patchProps(el, data) {
   
    for (let key in data) {
      if (key === 'style') { // style: { color: red }
        for (let styleName in data.style) {
          el.style[styleName] = data.style[styleName]
        }
      } else {
        // console.log('patchProps ', key, data)
        el.setAttribute(key, data[key])
      }

    }
  }

  function patch(oldVNode, vnode) {
    let isRealElement = oldVNode.nodeType // 初始化时 是真实dom 
    if (isRealElement) {
      const elm = oldVNode // 老节点
      const parentElm = elm.parentNode // 父元素
      let newElement = createElm(vnode) // 渲染的新真实dom
      // console.log('newElement ', newElement)
      parentElm.insertBefore(newElement, elm.nextSibling) // 先将新节点插入老节点后面
      parentElm.removeChild(elm) // 再删除老节点
      return newElement

    } else { // 更新逻辑 diff算法

    }
  }

  Vue.prototype._update = function (vnode) { // 将vnode转换成真实dom 替换el
    const vm = this
    // 既有初始化 又有更新的功能
    vm.$el = patch(vm.$el, vnode)

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