import { observe } from "./observe/index"

export function initState(vm){
  const opts = vm.$options
  if(opts.data){
    inintData(vm)
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