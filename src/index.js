import ininGlobalApi from "./globalapi"
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle"


function Vue(options){
  this._init(options) // 原型上组册了方法
}


initMixin(Vue)
initLifeCycle(Vue)
ininGlobalApi(Vue)

export default Vue