import Watcher, { nextTick } from "./observe/watcher"
import { mergeOptions } from "./utils"

export default function ininGlobalApi(Vue){
  Vue.prototype.$nextTick = nextTick
  Vue.prototype.$watch = function(exprOrFn, cb, options={user: true}){
    // console.log(exprOrFn, cb, options)
    //exprOrFn可能是字符串也可能是函数 firstName ()=>vm.firstName
    // 当firstName 值变化了 直接执行cb函数
    new Watcher(this, exprOrFn, options, cb)
  }
  Vue.options = {}
  Vue.mixin = function(mixin){
    // 将用户的选项与全局的合并
    
    this.options = mergeOptions(this.options, mixin)
    // console.log('this.options ', this.options)
  }
}





