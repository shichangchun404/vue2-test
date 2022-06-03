import { parseHtml } from "./parse";

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配我们的表达式变量 {{ name }}
function genProps(attrs){
  let str = ''
  attrs.forEach(attr => {
    if(attr.name === 'style'){
      let arr = attr.value.split(';')
      let obj = {}
      arr.reduce((obj, curr) => {
        let [k,v] = curr.split(':')
        // console.log(obj, k , v)
        obj[k] = v
        return obj
      },obj)
      attr.value = obj
    }
    str += `${attr.name}:${JSON.stringify(attr.value)}, `
  })
  return `{${str.slice(0,-2)}}`
}
function genChildren(children){
  return children.map(child => {
    return gen(child)
  }).join(',')
}
function gen(node){
  if(node.type === 1){
    return codegen(node)
  } else {
    // 文本节点
    let text = node.text

    if(!text.match(defaultTagRE)){ // 纯文本
      return `_v(${JSON.stringify(text)})`
    } else { // _v( _s(name) + 'hello' + _s(name) ) 带有 {{ name }}} 的文本内容

      let tokens = []
      let match
      let lastIndex = 0
      defaultTagRE.lastIndex = 0
      while(match = defaultTagRE.exec(text)){
        let index = match.index // 匹配的位置
        // console.log('match index ',match, index, text)
        if(index > lastIndex){
          tokens.push(JSON.stringify(text.slice(lastIndex,index)))
        }
        tokens.push(`_s(${match[1].trim()})`)
        lastIndex = index + match[0].length

      }
      if(lastIndex < text.length){
        tokens.push(JSON.stringify(text.slice(lastIndex)))
      }
      // console.log(tokens)
      return `_v(${tokens.join('+')})`
    }
   

  }
}
function codegen(ast){
  let children = genChildren(ast.children)
  let code = `_c(
              '${ast.tag}', 
               ${ast.attrs.length? genProps(ast.attrs) : 'null'},
               ${ast.children.length? children : ''}
            )`
  return code
}

export function compileToFunction(template) {

  // 1 将template 转换成ast语法树
  let ast = parseHtml(template)

  // 2 生成render方法 (执行后的结果 得到虚拟DOM)
  // 模板引擎shi实现原理 with + new Function
  let code = codegen(ast)
  code = `with(this){ return ${code}}`
  let render = new Function(code) // 根据代码生成函数

  return render

  // console.log('render = ', render)
  // render = (function anonymous(
  //   ) {
  //   with(this){ return _c(
  //                 'div', 
  //                  {id:"app", class:"app", style:{"color":"red","background":" gray"}},
  //                  _v(""),_c(
  //                 'div', 
  //                  {class:"name", disabled:true},
  //                  _v("hi "+_s(name)+", "+_s(name)+" hi")
  //               ),_v(""),_c(
  //                 'p', 
  //                  {class:"age"},
  //                  _v("i am "+_s(age)+" years old")
  //               ),_v("")
  //               )}
  //   })
  // render.call(vm) 就可以实现取值了
}