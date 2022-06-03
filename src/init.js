import { compileToFunction } from "./complier"
import { initState } from "./state"

export function initMixin(Vue){ // 给vue增加init方法
  Vue.prototype._init = function(options){ // 初始化操作
    const vm = this
    vm.$options = options
    // 初始化状态
    initState(vm)

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
      if(!opts.template && el){ // 配置中没有template 就以页面dom为模板
        template = el.outerHTML
      }else { // 否则以配置template的为模板
        template = opts.template
      }
      console.log(template)
      // 如果有template 需要对其编译
      if(template){
        const render = compileToFunction(template)
        opts.render = render
      }
    }
    // 最后统一了render函数为 opts.render
  }
}

