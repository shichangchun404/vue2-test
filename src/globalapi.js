import { mergeOptions } from "./utils"

export default function ininGlobalApi(Vue){
  Vue.options = {}
  Vue.mixin = function(mixin){
    // 将用户的选项与全局的合并
    this.options = mergeOptions(this.options, mixin)
    // console.log('this.options ', this.options)
  }
}





