import { parseHtml } from "./parse";

export function compileToFunction(template) {

  // 1 将template 转换成ast语法树
  parseHtml(template)

  // 生成render方法 (执行后的结果 得到虚拟DOM)
}