import Dep from "./dep"

let id = 0

// 每个属性都有一个dep（被观察者） watcher就是观察者（属性变化了 会通知观察者来更新） 观察者模式
class Watcher {
  constructor(vm, fn, options){
    this.id = id++
    this.renderWatcher = options // 是否是渲染watcher标识
    this.getter = fn // getter调用可以进行取值操作
    this.deps = [] // 后续需要的计算属性与清理工作
    this.depIds = new Set()
    this.get()
  }
  addDep(dep){
    let id = dep.id
    if(!this.depIds.has(id)){ // 一个组件 重复的属性只记录一次
      this.deps.push(dep)
      this.depIds.add(id)
      dep.addSub(this)
    }
  }
  get(){
    // 
    Dep.target = this // 全局唯一一份 
    this.getter() // 会触发get defineReactive函数
    Dep.target = null // 渲染完就清空 控制只在模板里取值时 才进行依赖收集 用户在js脚本里vm.xxx取值时 不触发
  }
  update(){
    console.log('watch update')
    // this.get() // 同步更新 这样赋值一次 更新一次 性能不好

    queueWatcher(this) // 把当前的watcher暂存起来
  }
  run(){
    console.log('watch run') // 在一次事件循环中 只执行一次
    this.get()
  }
}

let queue = []
let has = {}
let pending = false // 防抖

function queueWatcher(watcher){
  let id = watcher.id
  if(!has[id]){ // 对watcher去重
    queue.push(watcher)
    has[id] = true
    if(!pending){
      nextTick(flushSchedulerQueue,0) // 放到执行队列中 等所有的update执行完后 再执行一次 flushSchedulerQueue()
      pending = true
    }
  }
}
function flushSchedulerQueue(){
  let flushqueue = queue.slice(0)
  queue = [] // 在刷新的过程中可能有新的watcher进来 所以复制一份flushqueue 清空queue
  has = {}
  pending = false
  flushqueue.forEach(watcher => {
    watcher.run()
  })

}

let callbacks = []
let waiting = false
function flushCallbacks(){
  let cbs = callbacks.slice(0)
  callbacks = []
  waiting = false
  cbs.forEach(cb => cb()) // 按照顺序依次执行
}
// netxTick 同步将任务放到任务队列中（先后依次放入） 任务队列中的任务是异步执行的
// vue中nextTick 的异步处理 api采用优化降级方案
// promise(ie不兼容) > MutationObserver（h5） > setImmediate（ie独有） > setTimeout
let timerFunc
if(Promise){
  console.log('timerFunc Promise')
  timerFunc = ()=>{
    Promise.resolve().then(flushCallbacks)
  }
}else if(MutationObserver){
  console.log('timerFunc MutationObserver')
  let obser = new MutationObserver(flushCallbacks)
  let textNode = document.createTextNode(1)
  obser.observe(textNode,{
    characterData: true
  })
  timerFunc = ()=>{
    textNode.textContent = 2
  }
}else if(setImmediate){
  console.log('timerFunc setImmediate')
  timerFunc = ()=>{
    setImmediate(flushCallbacks)
  }
}else{
  console.log('timerFunc setTimeout')
  timerFunc = ()=>{
    setTimeout(flushCallbacks)
  }
}
export function nextTick(cb){
  callbacks.push(cb)
  if(!waiting){
    // Promise.resolve().then(flushCallbacks) // vue3 
    timerFunc() // vue2
    waiting = true
  }
}





// 不同的组件有不同的watcher new Watcher() 有唯一的id

// 每个属性都有一个dep 而且只会new Dep()一次， 一个组件中的多个同名属性，是一个dep实例（id一样） 目的是收集watcher

// 一个组件有多个属性 就会有n个dep n个dep对应一个watcher

// 一个属性对应多个视图(组件) 一个dep 对应多个watcher

export default Watcher