import { compileToFunction } from "./compiler"
import { callHook, mountComponent } from "./lifecycle"
import { initState } from "./state"
import { mergeOptions } from "./utils"

export function initMixin(Vue){ // 给vue增加init方法
  Vue.prototype._init = function(options){ // 初始化操作
    const vm = this

    // 将所有选项合并
    vm.$options = mergeOptions(this.constructor.options, options) 

    callHook(vm, 'beforeCreate') // beforeCreate 生命周期

    // 初始化状态
    initState(vm)

    callHook(vm, 'created') // created 生命周期

    if(options.el){
      vm.$mount(options.el)
    }


  }

  Vue.prototype.$mount = function(el){
    const vm = this
    el = document.querySelector(el)
    let opts = vm.$options
    if(!opts.render){ // 配置中没有render
      let template
      if(!opts.template){ // 配置中没有template 就以页面dom为模板
        template = el.outerHTML
      }else { // 否则以配置template的为模板
        template = opts.template
      }
      // console.log(template)
      // 如果有template 需要对其编译
      if(template){
        const render = compileToFunction(template)
        opts.render = render
      }
    }
    // 最后统一了render函数为 opts.render
    // console.log('opts.render ', opts.render)

    mountComponent(vm, el) // 组件的挂载
  }
}


