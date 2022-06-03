const ncname = `[a-zA-Z_][\\-\\.0-9a-zA-Z]*`
const qnamecaputre = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnamecaputre}`) // 匹配标签开始 <div  匹配的分组是一个标签名
// console.log(startTagOpen)
const endTag = new RegExp(`^<\\/${qnamecaputre}[^>]*>`) // 匹配标签结束 </div>
// console.log(endTag)
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^'])'+|([^\s"'=<>`]+)))?/ // 匹配属性 第一个分组是key 分组345是value
// console.log('attribute ', attribute)
const startTagClose = /^\s*(\/?)>/ // 开始标签的结束 /> 或 > 自闭和标签
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 匹配我们的表达式变量 {{ name }}

function pasrseHtml(html) {
  const ELEMENT_TYPE = 1
  const TEXT_TYPE = 3
  let stack = [] // 用于存放匹配到开始标签的父元素
  let currentParent // 指向stack中的最后一项
  let root // 根节点

  // 创建一棵抽象语法树
  function creatASTElement(tag, attrs) {
    return {
      tag,
      attrs,
      type: ELEMENT_TYPE,
      parent: null,
      children: []
    }
  }

  function advance(n) {
    html = html.substring(n)
  }

  function parseStartTag() {
    const start = html.match(startTagOpen)
    // console.log(start)
    if (start) {
      const match = {
        tagName: start[1], // 标签名
        attrs: []
      }
      advance(start[0].length) // 对匹配完的内容进行删除

      // 如果不是开始标签的结束 一直匹配下去 （匹配属性）
      let end, attr
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        advance(attr[0].length) // 删除属性
        console.log('match attr ', attr)
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || true
        })
      }
      if (end) {
        advance(end[0].length) // 删除 开始标签的结束
      }
      console.log('match ', match)
      console.log(html)
      return match
    }
    return false // 结束标签
  }

  function start(tag, attrs) {
    let node = creatASTElement(tag, attrs)
    if (!root) {
      root = node
    }
    if (currentParent) {
      node.parent = currentParent
      currentParent.children.push(node)
    }
    stack.push(node)
    currentParent = node
  }

  function end(tag) {
    let node = stack.pop() // 弹出最后一个 并且校验标签是否合法
    if(node.tag === tag){
      currentParent = stack[stack.length - 1]
    } else {
      console.wran(`tag ${tag} 不合法`)
    }
   
  }

  function chars(text) { // 文本节点 直接放到当前指向的节点中
    text = text.trim()
    currentParent.children.push({
      text,
      type: TEXT_TYPE,
      parent: currentParent
    })
  }
  while (html) { // 最初html以<开始 匹配完就对标签字符串进行删除

    let textEnd = html.indexOf('<') // 如果textEnd是0 则说明是一个标签 可能开始标签 或者 结束标签。如果大于0 则是文本的结束位置

    // 1 匹配标签
    if (textEnd === 0) {
      // 1.1 匹配开始标签
      const startTagMatch = parseStartTag() // 开始标签的匹配结果
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }

      // 1.2 匹配结束标签
      let endTagMatch = html.match(endTag)
      if (endTagMatch) {
        advance(endTagMatch[0].length)
        end(endTagMatch[1])
        continue
      }

    }

    // 2 匹配文本内容
    if (textEnd > 0) {
      let text = html.substring(0, textEnd) // 文本内容

      if (text) {
        advance(text.length)
        chars(text)
      }
      continue
    }
  }
  console.log('html = ', html)
  console.log('ast语法树 root = ', root)
}

export function compileToFunction(template) {

  // 1 将template 转换成ast语法树
  pasrseHtml(template)

  // 生成render方法 (执行后的结果 得到虚拟DOM)
}