import Dep from "./observe/dep"
import { observe } from "./observe/index"
import Watcher from "./observe/watcher"

export function initState(vm){
  const opts = vm.$options
  if(opts.data){
    inintData(vm)
  }
  if(opts.computed){
    initComputed(vm)
  }
  if(opts.watch){
    initWatch(vm)
  }
}

function proxy(vm, target, key){
  Object.defineProperty(vm, key, {
    get(){
      return vm[target][key]
    },
    set(newValue){
      vm[target][key] = newValue
    }
  })
}

function inintData(vm){
  let data = vm.$options.data
  data = typeof data == 'function'? data.call(vm) : data

  // 将data放到实例对象上  vm.$options.data为函数时得到一个纯对象 使vm._data数据为响应式的 所以组件的data要使用函数的形式
  vm._data = data
  // 对数据进行劫持
  observe(data)


  // 访问方式由 vm._data.name >>>> vm.name 通过
  Object.keys(data).forEach(key => {
    proxy(vm,'_data',key)
  })
}

function initComputed(vm){
  let computed = vm.$options.computed
  let watchers = vm._computerWatchers = {}

  for(let key in computed){
    let userDef = computed[key]
    const getter = typeof userDef == 'function' ? userDef : userDef.get

    // 监控计算属性中get的变化 如果直接 new Watcher() 默认会执行fn
    watchers[key] = new Watcher(vm, getter, {lazy: true}) // 将计算属性 与watcher关系起来
    
    defindeComputed(vm, key, userDef)
  }
}

function defindeComputed(vm, key, userDef){
 
  const setter = userDef.set || (()=>{})
  Object.defineProperty(vm, key, {
    get: createComputedGetter(key),
    set: setter
  })
}

// 计算属性不收集依赖 而是让其依赖的属性去收集依赖
function createComputedGetter(key){
  // 需要检测是否执行这个getter
  return function(){
    let watcher = this._computerWatchers[key] // 对应属性的watcher
    if(watcher.dirty){
      watcher.evalute() // 求值后dirty为false 下次就不取了
    }
    // console.log('createComputedGetter watcher ', watcher)
    if(Dep.target){ // 计算属性出栈后 还要渲染watcher 让计算属性watcher里的属性 去收集上一层watcher
      watcher.depend()
    }
    return watcher.value
  }
}

function initWatch(vm){
  const watch = vm.$options.watch
  for(let key in watch){
    let handler = watch[key] // 可能是字符串 数组 函数 对象
    if(Array.isArray(handler)){
      handler.forEach(item => {
        createWatch(vm, key, item)
      })
    }else{
      createWatch(vm, key, handler)
    }

  }
}

function createWatch(vm, key, handler){
  let options = { user: true } // 表示用户自己写的watch
  // hangdler 可能是字符串 函数 对象
  if(typeof handler === 'string'){ // 是字符串时 key是menthods中的方法名 回调函数即是其方法体
    handler = vm[handler]
  }
  if(typeof handler === 'object'){
    handler = handler['handler']
    options.deep = handler.deep
    options.immde = handler.immde
  }
  // console.log(key, handler, options)
  return vm.$watch(key, handler, options)
}