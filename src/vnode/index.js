export function createElementVNode(vm, tag, data, ...children){
  data = data || {}
  let key
  if(data){
    key = data.key
  }
  children = children.filter(it => it) // 将 [undefiend] 过滤掉
  
  if(isReservedTag(tag)){
    return vnode(vm, tag, key, data, children)
  }else {
    // 创建一个组件的虚拟节点
    let Ctor = vm.$options.components[tag]
    return createComponentVnode(vm, tag, key, data, children, Ctor)
  }
  
}

export function createTextVNode(vm, text){
  return vnode(vm, undefined, undefined, undefined, undefined, text)
}

export function isSameVnode(vnode1,vnode2){
  return vnode1.tag === vnode2.tag && vnode1.key == vnode2.key
}

// ast是语法层面的转换 他描述的是语法本身 可以描述js css html
// 虚拟dom描述的dom元素 可以增加一些自定义属性
function vnode(vm, tag, key, data, children, text, componentOptions){
  return {
    vm,
    tag,
    key,
    data,
    children,
    text,
    componentOptions
  }
}

// 判断是否是原始标签
function isReservedTag(tag){
  return ['div','p','ul','li','span','button','h1','h2','h3'].includes(tag)
}

function createComponentVnode(vm, tag, key, data, children, Ctor){
  if(typeof Ctor === 'object'){
    Ctor = vm.$options._base.extend(Ctor)
  }
  data.hook = {
    init(vnode){ // 创建真实节点时 如果是组件 调用此方法
      // 保存组件的实例
      let instance = vnode.componentInstance = new vnode.componentOptions.Ctor
      instance.$mount()
    }
  }
  return vnode(vm, tag, key, data, children, null, {Ctor})
}