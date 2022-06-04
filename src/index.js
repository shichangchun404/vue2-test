import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle"
import { nextTick } from "./observe/watcher"

function Vue(options){
  this._init(options) // 原型上组册了方法
}

Vue.prototype.$nextTick = nextTick
initMixin(Vue)
initLifeCycle(Vue)

export default Vue