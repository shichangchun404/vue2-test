// 重写数组变异的7个方法 并且要保留原来的方法

let oldArrayProto = Array.prototype

// newArrayProto.__proto__ = oldArrayProto
let newArrayProto = Object.create(oldArrayProto)

let methods = ['push', 'unpush', 'unshift', 'shift', 'reserse', 'sort', 'splice']

methods.forEach(method => {
  // arr.push(1,2,3)
  newArrayProto[method] = function(...args){ // 重写数组方法
    // 自定义功能 
    console.log('重写数组方法 ... ', method)

    // this >>> arr
    const result = oldArrayProto[method].call(this,...args) // 内部调用原来的方法 函数劫持 切片编程

    // 如果对数组新增项 要对它进行劫持
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break;
      case 'splice':
        inserted = args.slice(2)
      default:
        break;
    }
    console.log('inserted ', inserted)
    if(inserted){
      ob.observeArray(inserted)
    }


    return result
  }
})

export default newArrayProto
