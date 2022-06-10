import ininGlobalApi from "./globalapi"
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle"
import { inintStateMixin } from "./state"


class Vue{
  constructor(options){
    this._init(options) // 原型上组册了方法
  }
}


initMixin(Vue)
initLifeCycle(Vue)
ininGlobalApi(Vue)
inintStateMixin(Vue)


export default Vue