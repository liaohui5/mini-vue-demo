import { isFunction } from '@mini-vue/shared';

// 更新队列
const queue: Array<CallableFunction> = [];
let isFlushPending = false;
let promise = Promise.resolve();

// 添加任务队列中
export function queueJobs(job: CallableFunction) {
  if (!queue.includes(job)) {
    queue.push(job);
  }
  queueFlush();
}

// 微任务执行时机
export function nextTick(fn?: CallableFunction) {
  return fn ? promise.then(fn) : promise;
}

// 执行队列
function queueFlush() {
  if (isFlushPending) {
    return;
  }

  nextTick(flushJobs);
}

// 执行所有任务
function flushJobs() {
  isFlushPending = false;
  let job: any;
  while ((job = queue.shift())) {
    isFunction(job) && job();
  }
}
