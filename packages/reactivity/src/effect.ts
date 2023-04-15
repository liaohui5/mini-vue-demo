import { definePrivateProp, extend } from '@mini-vue/shared';

// 依赖收集的容器Map
const targetMap = new Map();

// 当前 effect 执行产生的 ReactiveEffect 实例
let activeEffect: ReactiveEffect | undefined = undefined;

// 是否应该收集依赖(在stop后不需要收集依赖)
let shouldTrack: boolean = false;

export class ReactiveEffect {
  public deps: Array<Set<ReactiveEffect>> = []; // 收集 depset
  public isActive: boolean = true; // 如果被清空了就标记为 false
  public scheduler?: CallableFunction; // 如果传入就, 第一次调用 fn, 然后触发依赖时调用这个函数
  public onStop?: CallableFunction; // 在调用 stop 时调用
  public constructor(public fn: CallableFunction, options: IEffectOptions = {}) {
    Object.keys(options).length && extend(this, options); // 不为空才赋值
  }

  // 执行 fn
  public run() {
    // 如果被 reactiveEffect 被清除了, 就不需要
    // 收集依赖了, 否则则需要收集依赖收集完了之后
    // 需要重新初始化 shouldTrack, 避免影响下一个
    // ruh 的执行(因为 shouldTrack 是一个全局变量,
    // 如果不初始化, 就会影响下一个 run 的执)
    if (!this.isActive) {
      return this.fn();
    }
    shouldTrack = true;
    activeEffect = this;
    const result = this.fn();

    // 重置
    shouldTrack = false;
    activeEffect = undefined;
    return result;
  }

  // 停止收集依赖
  public stop() {
    if (this.isActive) {
      cleanEffects(this);
      this.onStop && this.onStop();
      this.isActive = false;
    }
  }
}

// 清除依赖
function cleanEffects(reactiveEffect: ReactiveEffect) {
  for (const depset of reactiveEffect.deps) {
    depset.delete(reactiveEffect);
  }
}

// effect 第二个参数
interface IEffectOptions {
  scheduler?: CallableFunction;
  onStop?: CallableFunction;
}

// effect 返回值
interface IEffectRunner {
  reactiveEffect: ReactiveEffect;
  (): any;
}

// 响应式对象(reactive/ref返回值)影响函数
export function effect(fn: CallableFunction, options: IEffectOptions = {}): IEffectRunner {
  const reactiveEffect = new ReactiveEffect(fn, options);

  // 先执行一遍 fn
  reactiveEffect.run();

  // 返回 runner
  const runner = reactiveEffect.run.bind(reactiveEffect);
  definePrivateProp(runner, 'reactiveEffect', reactiveEffect);
  return runner as IEffectRunner;
}

// 停止触发依赖
export function stop(runner: IEffectRunner): void {
  runner.reactiveEffect.stop();
}

// 是否需要收集依赖
export function isTracking(): boolean {
  return Boolean(shouldTrack && activeEffect !== undefined);
}

/*
----- 收集依赖 -----
维护成以下的数据格式:
targetMap {
  [ target1 ] = {
    [ key1 ] = depset [ reactiveEffect1, reactiveEffect2 ...],
    [ key2 ] = depset [ reactiveEffect1, reactiveEffect2 ...]
  },
  [ target2 ] = {
    [ key1 ] = depset [ reactiveEffect1, reactiveEffect2 ...],
    [ key2 ] = depset [ reactiveEffect1, reactiveEffect2 ...]
  }
}

1. 根据 target 从 targetMap 中找到 depsMap { [key1] = depset [..] }
2. 根据 key  从 depsMap 中找到 depset [ reactiveEffect1 ... ]
3. 遍历执行 run/scheduler 方法
*/
export function track(target: object, key: string | symbol): void {
  if (!isTracking()) {
    return;
  }
  // container -> target -> key -> effect
  // { [target]: { key: [ effect1, effect2 ] } }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let depset = depsMap.get(key);
  if (!depset) {
    depset = new Set();
    depsMap.set(key, depset);
  }

  // 收集依赖
  trackEffects(depset);
}

// 收集 effects 到 depset
export function trackEffects(depset: Set<ReactiveEffect>): void {
  if (!depset.has(activeEffect!)) {
    depset.add(activeEffect!);
    activeEffect!.deps.push(depset);
  }
}

// 触发依赖执行
export function trigger(target: object, key: string | symbol): void {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const depset = depsMap.get(key);
  depset && triggerEffects(depset);
}

// 触发 depset 中的所有依赖执行
export function triggerEffects(depset: Set<ReactiveEffect>): void {
  for (const reactiveEffect of depset) {
    if (reactiveEffect.scheduler) {
      reactiveEffect.scheduler();
    } else {
      reactiveEffect.run();
    }
  }
}
