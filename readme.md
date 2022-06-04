# Vue 核心流程

## 创造响应式数据
1 initState 针对对象 Object.defineProperty 针对数组重写数组7个方法

## 模板转换成ast语法树

## 将ast语法树转换成render函数
render函数(内部调用_c _v _s 函数 并取值操作) 

## vm._render 与 vm._update
vm._render()函数会进行调用render 生成对应虚拟DOM(object对象)
vm._update(vnode) 根据虚拟DOM 产生真是DOM

## 数据跟新 只调render函数 无需执行ast转换过程
  -- render 函数执行产生虚拟节点 使用响应式数据
  -- 根据虚拟节点 生成真是DOM


  # 观察者实现依赖收集
  1 给模板中的属性 添加收集器(dep)
  2 页面渲染时 将页面渲染逻辑封装到watcher中（vm._update(vm._render) ）
  3 让dep记住这个watcher 属性变化了 让对应的dep中存放的watcher进行更新渲染
  # 异步更新策略

  # mixin实现原理