import babel from 'rollup-plugin-babel'
// 导出一个对象 作为rollup配置文件 默认查找根目录下的rollup.config.js
export default {
  input: './src/index.js', // 打包入口文件
  output: { // 打包出口文件
    file: './dist/vue.js',
    name: 'Vue', // global.Vue
    format: 'umd' , // esm es6 , commomjs iife自执行函数 umd(兼容cjs amd)
    sourcemap: true,
  }, 
  plugins: [
    babel({
      exclude: 'node_modules/**'
    })
  ]
}