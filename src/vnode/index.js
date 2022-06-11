export function createElementVNode(vm, tag, data, ...children){
  let key
  if(data){
    key = data.key
  }
  return vnode(vm, tag, key, data, children)
}

export function createTextVNode(vm, text){
  return vnode(vm, undefined, undefined, undefined, undefined, text)
}

export function isSameVnode(vnode1,vnode2){
  return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key
}

// ast是语法层面的转换 他描述的是语法本身 可以描述js css html
// 虚拟dom描述的dom元素 可以增加一些自定义属性
function vnode(vm, tag, key, data, children, text){
  return {
    vm,
    tag,
    key,
    data,
    children,
    text
  }
}