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

  # 计算属性
  计算属性初始化，通过Object.defineProperty将每个属性绑定到vm实例上，并给每个计算属性new Watcher(), get函数作为Watcher的第二个参数
  每个计算属性都有一个watcher 其特有的属性：lazy dirty value 方法有：evalute()
    -- lazy 默认true 控制初始化new Watcher()时 不触发get函数(不同于渲染watcher会立即执行get)
    -- dirty 默认ture 控制多次取计算属性时 不用多次重复计算 当依赖的属性没有改变时 直接返回value 当依赖属性改变时 dirty修改为false 控制其是否重新计算
    -- value 计算属性的结果值（get函数执行结果）
    -- evalute 调用get 获取value值 并将this.dirty设置为false 注意此时的watcher为计算属性watcher
  计算属性不收集依赖 而是让其依赖的属性去收集依赖 当计算属性的get函数执行时，会触发其依赖的属性get，从而触发依赖属性收集watcher, 依赖的属性会收集计算属性的watcher
  当计算属性依赖的属性变化时 依赖属性的dep会notify其收集的watcher 进行对应的update操作 此时计算属性watcher只跟新了dirty=true 特面内容的更新是通过渲染watcher的update触发 应为模板引用了计算属性 此时会对计算属性重新取值,执行evalute()!
  计算属性watcher出栈后 还要渲染watcher 让计算属性watcher里的属性 去收集上一层watcher