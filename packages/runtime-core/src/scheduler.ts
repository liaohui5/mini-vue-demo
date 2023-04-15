import { isFunction } from '@mini-vue/shared';

// 更新队列
const queue: Array<CallableFunction> = [];
const activePreFlushCbs: Array<CallableFunction> = [];
let isFlushPending = false;
let promise = Promise.resolve();

// 添加任务队列中
export function queueJobs(job: CallableFunction) {
  if (!queue.includes(job)) {
    isFunction(job) && queue.push(job);
  }
  queueFlush();
}

// nextTick 微任务执行时机
export function nextTick(fn?: CallableFunction): Promise<void> {
  /* @ts-ignore */
  return isFunction(fn) ? promise.then(fn) : promise;
}

// 添加前置任务 & 执行 nextTick 任务之前执行
export function queuePreFlushCb(job: CallableFunction) {
  activePreFlushCbs.push(job);
  queueFlush();
}

// 执行队列中所有任务
function queueFlush() {
  if (isFlushPending) {
    return;
  }
  nextTick(flushJobs);
}

// 执行所有任务(更新视图)
function flushJobs() {
  isFlushPending = false;
  // 执行 watchEffect 添加的前置任务队列
  flushPreCallbacks();

  let job: any;
  while ((job = queue.shift())) {
    job();
  }
}

// 执行 watchEffect 添加的 nextTick 前置任务 { flush: 'pre' }
// https://cn.vuejs.org/api/reactivity-core.html#watcheffect
function flushPreCallbacks() {
  for (const job of activePreFlushCbs) {
    job();
  }
}
