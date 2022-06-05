import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle"
import Watcher, { nextTick } from "./observe/watcher"

function Vue(options){
  this._init(options) // 原型上组册了方法
}

Vue.prototype.$nextTick = nextTick
Vue.prototype.$watch = function(exprOrFn, cb, options={user: true}){
  // console.log(exprOrFn, cb, options)
  //exprOrFn可能是字符串也可能是函数 firstName ()=>vm.firstName
  new Watcher(this, exprOrFn, options, cb)

}
initMixin(Vue)
initLifeCycle(Vue)

export default Vue