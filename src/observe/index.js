import Dep from "../dep"
import newArrayProto from "./array"

class Observer {
  constructor(data) {

   this.dep = new Dep() // 给所有的对象和数组都添加dep属性

    // 把Observer实例赋值给data.__ob__ 使data可以灵活的使用walk与observeArray方法 进行劫持操作 
    // 可以观察数据如果有__ob__属性 则表示被观察过了 通过它做一次拦截标识 否则会死循环加__ob__  所以将__ob__设置成不可枚举
    // data.__ob__ = this // 有问题
    Object.defineProperty(data, '__ob__', {
      value: this,
      enumerable: false, // 设置不可枚举 循环时不获取该属性
    })

    // object.defineProperty只能劫持已存在的属性 后增删除的不知道 vue2为此设置了单独的方法处理 $set
    // 并且劫持数组中的每项 如果数组的item是对象 同样可以被劫持
    if (Array.isArray(data)) {
      // data 为数组时 重写数组中能修改自身的7个方法 push() unpush() unshift() shift() splice() reserse() sort()
      // data.__proto__ = { // 这样重写不优雅 数组原功能无法使用
      //   push() {
      //     console.log('重写数组中push')
      //   }
      // }
      data.__proto__ = newArrayProto
      
      this.observeArray(data)
    } else { // data 为对象时 遍历
      this.walk(data)
    }

  }
  walk(data) { // 循环对象 对属性依次劫持
    // 重新定义属性 性能差的原因！！！
    Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key])
    })
  }
  observeArray(data) {
    data.forEach(item => {
      observe(item)
    })
  }
}
function dependArray(value){
  value.forEach(item => {
    item.__ob__&&item.__ob__.dep.depend()
    if(Array.isArray(item)){
      dependArray(item)
    }
  })
}

export function defineReactive(target, key, value) { // 此处为闭包
  let childob = observe(value) // 当 value = [1,2,3] 数组的每一项是无法劫持 无法直接收集依赖
  const dep = new Dep(key) 
  // 每个属性都有一个dep 注意此处与下面的执行顺序 一个属性只定义一次（new Dep(key) ） 取值会取多次
  //（一个组件中的同个属性有多个 但是只有一个dep实例但是同个属性 dep）

  Object.defineProperty(target, key, {
    get() { // 获取值时 同名属性会取多次  但是是一个dep实例 因为形成闭包 dep不会被销毁
      if(Dep.target){
        dep.depend() // 让这个属性 记住当前的watcher *******  核心 依赖收集       *******
        if(childob){
          childob.dep.depend() // 让数组与对象本身 也进行依赖收集
          if(Array.isArray(value)){
            dependArray(value)
          }
        }
      }
      return value
    },
    set(newValue) { // 设置值时触发
      // console.log('set value ', 'oldValue= ', value, 'newValue=', newValue)
      if (value === newValue) return
      value = newValue
      dep.notify() // *******  核心 通知更新       *******
    }
  })

}

export function observe(data) {
  // console.log('observe ',data)
  if (typeof data != 'object' || data == null) { // 只对对象劫持
    return
  }
  if(data.__ob__ instanceof Observer){ // 如果数据已经被劫持了 会有__ob__属性 
    return data.__ob__
  }
  // 如果一个对象被劫持了 就不需要再劫持了 （可以通过增加一个实例 来判断是否被劫持过）
  return new Observer(data)


}