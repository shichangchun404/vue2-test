import { isSameVnode } from "."

export function createElm(vnode) {
  const {
    vm,
    tag,
    data,
    children,
    text
  } = vnode
  if (typeof tag === 'string') { // 标签
    vnode.el = document.createElement(tag)
    patchProps(vnode.el, {}, data)
    children.forEach(child => { // 递归创建子真实节点 
      vnode.el.appendChild(createElm(child))
    })

  } else [ // 文本
    vnode.el = document.createTextNode(text)
  ]
  return vnode.el // 返回真实节点
}

export function patchProps(el, oldDate, data) {
  oldDate = oldDate || {}
  data = data || {}
  let oldStyles = oldDate.style || {}
  let newStyles = data.style || {}
  for(let key in oldStyles){
    if(!newStyles[key]){
      el.style[key] = ''
    }
  }
  for(let key in oldDate){
    if(!data[key]){
      el.removeAttribute(key)
    }
  }
 
  for (let key in data) {
    if (key === 'style') { // style: { color: red }
      for (let styleName in data.style) {
        el.style[styleName] = data.style[styleName]
      }
    } else {
      el.setAttribute(key, data[key])
    }

  }
}

export function patch(oldVNode, vnode) {
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
    // 两个节点不一样 直接删除老的换上新的
    return patchVnode(oldVNode, vnode)

    // 
  }
}

function patchVnode(oldVNode, vnode){
  if(!isSameVnode(oldVNode, vnode)){
    let newElement = createElm(vnode)
    oldVNode.el.parentNode.replaceChild(newElement, oldVNode.el)
    return newElement
  }
  
  // 以下是相同节点
  // 文本节点不同 替换文本内容
  const el = vnode.el = oldVNode.el
  if(!oldVNode.tag){
    if(oldVNode.el.textContent !== vnode.text){
      oldVNode.el.textContent = vnode.text // 用新的文本覆盖老的
    }
  }

  // 比较属性
  patchProps(el, oldVNode.data, vnode.data)

  // 比较子节点 
  let oldChildren = oldVNode.children || []
  let newChildren = vnode.children || []
  if(oldChildren.length && newChildren.length){ // 老节点 和新节点都有 儿子 最复杂的核心算法
    updateChildren(el, oldChildren, newChildren)
  } else if(newChildren.length){ // 只有新节点有儿子
    mountedChild(el, newChildren)
  } else if(oldChildren.length){ // 只有老节点有儿子 新的没有
    el.innerTHML = ''
  }
  return el
}

function mountedChild(el, newChildren){
  newChildren.forEach(child => {
    let newEl = createElm(child)
    el.appendChild(newEl)
  })
}

function updateChildren(el, oldChildren, newChildren){ // 利用双指针循环
  // 头指针
  let oldStartIndex = 0
  let newStartIndex = 0
  // 尾指针
  let oldEndIndex = oldChildren.length - 1
  let newEndIndex = newChildren.length - 1
  //
  let oldStartVnode = oldChildren[0]
  let newStartVnode = newChildren[0]
  let oldEndVnode = oldChildren[oldEndIndex]
  let newEndVnode = oldChildren[newEndIndex]

  function makeMapByKey(oldChildren){
    oldChildren.reduce((map,child, index)=>{
      map[child.key] = index
      return map
    },{})
  }
  let map = makeMapByKey(oldChildren)

  while(oldEndIndex >= oldStartIndex && newEndIndex >= newStartIndex){
    // 优先处理特殊场景 push pop unshift shift reserve sort
    // el.insertBefore(moveEl,target) 会将元素移动 target=null时，相当于appendChild()
    if(!oldStartVnode){
      oldStartVnode = oldChildren[++oldStartIndex]
    } else if(!oldEndVnode){
      oldEndVnode = oldChildren[--oldEndIndex]
    }
    // 从头头开始比较
    else if(isSameVnode(oldStartVnode, newStartVnode)){ 
      patchVnode(oldStartVnode, newStartVnode)
      oldStartVnode = oldChildren[++oldStartIndex]
      newStartVnode = newChildren[++newStartIndex]
    }
    // 从尾尾部开始比较
    else if(isSameVnode(oldEndVnode, newEndVnode)){ 
      patchVnode(oldEndVnode, newEndVnode)
      oldEndVnode = oldChildren[--oldEndIndex]
      newEndVnode = newChildren[--newEndIndex]
    }
    // 交叉比较 老尾新头
    else if(isSameVnode(oldEndVnode, newStartVnode)){
      patchVnode(oldEndVnode, newStartVnode)
      el.insertBefore(oldEndVnode.el, oldStartVnode.el) // 将老节点尾部移动到老节点头部
      oldEndVnode = oldChildren[--oldEndIndex]
      newStartVnode = newChildren[++newStartIndex]
    }
    // 交叉比较 老头新尾
    else if(isSameVnode(oldStartVnode, newEndVnode)){
      patchVnode(oldStartVnode, newEndVnode)
      el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling, ) // 将老头 移动到 老尾下一个之前
      oldStartVnode = oldChildren[++oldStartIndex]
      newEndVnode = newChildren[--newEndIndex]
    }
    // 乱序比较 将老的oldChildren 做一个映射表 拿新的从头开始去表里查找 
    // case1 找到则将老的移动到老的start前面 newStartIndex++ 并且将这一项设置为undefined
    // case2 找不到则将新的插入老的start前面 newStartIndex++
    // case3 老的剩余的删除
    else {
      let moveIndex = map[newStartIndex]
      if(moveIndex != undefined){ // case1
        let moveVnode = oldChildren[moveIndex]
        el.insertBefore(moveVnode.el, oldStartVnode.el)
        oldChildren[moveIndex] = undefined
        patchVnode(moveVnode, newStartVnode)
      }else{ // case2
        el.insertBefore(createElm(newStartVnode), oldStartVnode.el)
      }
      newStartVnode = newChildren[++newStartIndex]
    }
  }
  if(newEndIndex >= newStartIndex){ // 新的多了 插入(头/尾)
    for(let i = newStartIndex; i <= newEndIndex; i++){
      let childEl = newChildren[i]
      let anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1] : null // 从头开始比anchor=null 从尾开始比 
      el.insertBefore(childEl,anchor) // anchor=null 时  相当于appendChild()
     
    }
  }
  if(oldStartIndex < newEndIndex){ // 老得多了 删除
    for(let i = oldStartIndex; i <= newEndIndex; i++ ){
      if(oldChildren[i]){ // 可能在乱序比较中设置成了undefined
        let oldEl = oldChildren[i].el
        el.removeChild(oldEl)
      }
      
    }
  }

}