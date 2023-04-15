import {  ReactiveEffect } from '@mini-vue/reactivity';
import { queuePreFlushCb } from '../src/scheduler';

export function watchEffect(source: CallableFunction) {
  // 任务函数, 不能直接添加 reactiveEffect.run,
  // 执行时 this 指向会有问题, 还有必须用 reactiveEffect.run
  // 来执行, 而不应该直接执行 source
  function job(): any {
    return reactiveEffect.run();
  }

  // 响应式对象值变化之后执行 scheduler
  const scheduler = () => {
    queuePreFlushCb(job);
  };

  // reactiveEffect run 要执行的函数
  let cleanup: CallableFunction | undefined;
  function getter(): void {
    cleanup && cleanup();
    source(onCleanup);
  }
  const reactiveEffect = new ReactiveEffect(getter, { scheduler });

  // 在清除 reactEffect 依赖的时候给 cleanup 赋值,
  // 那么下次执行 getter 的时候就会执行这个传入的 cleanupCallback
  function onCleanup(cleanupCallback: CallableFunction): void {
    cleanup = reactiveEffect.onStop = cleanupCallback;
  }

  // 第一次进入直接执行 fn,
  reactiveEffect.run();

  // 停止 watch 监听 -> 清除 ReactiveEffect 依赖
  return () => reactiveEffect.stop();
}
