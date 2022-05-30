import { initMixin } from "./init"

function Vue(options){
  this._init(options) // 原型上组册了方法
}

initMixin(Vue)

export default Vue