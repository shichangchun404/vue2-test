let id = 0

class Dep {
  constructor(key){
    this.id = id++
    this.subs = [] // 存放当前属性 存放的watcher
  }
  depend(){
    // this.subs.push(Dep.target)
    // 不能放重复的watcher
    // watcher也记录dep
    Dep.target.addDep(this) // 将dep 传给watcher的addDep方法处理 在该函数里进行去重处理
  }
  addSub(watcher){
    this.subs.push(watcher)
  }
  notify(){
    this.subs.forEach(watcher => {
      watcher.update()
    })
  }
}
Dep.target = null

export default Dep