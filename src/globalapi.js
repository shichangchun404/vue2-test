import { mergeOptions } from "./utils"

export default function ininGlobalApi(Vue){
  Vue.options = {
    _base: Vue
  }
  Vue.mixin = function(mixin){
    // 将用户的选项与全局的合并
    this.options = mergeOptions(this.options, mixin)
    // console.log('this.options ', this.options)
  }

  Vue.extend = function(options){
    function Sub(options={}){
      this._init(options) // 继承了Vue原型上_init方法
    }
    Sub.prototype = Object.create(Vue.prototype) // Sub.prototype.__proto__ = Vue.prototype
    Sub.prototype.constructor = Sub
    Sub.options = mergeOptions(Vue.options, options) 
    return Sub
  }

  // 定义全局组件APi
  Vue.options.components = {}
  Vue.component = function(id, definition){
    definition = typeof definition === 'function'? definition : Vue.extend(definition)
    Vue.options.components[id] = definition
  }


}





