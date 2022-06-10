// 策略模式
const strats = {}
const lifecycle = ['beforeCreate', 'created', 'beforeMount', 'mounted']
lifecycle.forEach(hook => { // 生命周期的mixin混入规则 同名的钩子放入一个数组
  strats[hook] = function(p, c){
    if(c){ // 有mixin选项
      if(p){
        return p.concat(c)
      }else{ // 每一项第一次 初始化时 Vue.options = {}
        return [c]
      }
    }else{
      return p
    }
  }
})

export function mergeOptions(parent, child){
  const options = {}

  for (const key in parent) { // 老得
    if (parent.hasOwnProperty(key)) {
      mergeField(key)
    }
  }
  for (const key in child) { // 新的
    if (!parent.hasOwnProperty(key)) { // 这里过滤掉parent已经合并的key 值以chilid优先
      mergeField(key)
    }
  }
  function mergeField(key){
    if(strats[key]){  // 针对不同的mixin项 采用不用的策略
      options[key] = strats[key](parent[key], child[key])

    }else { // 默认策略
      options[key] = child[key] || parent[key] // 同名的key 优先使用child
    }
  }
  return options
}