import { reactive } from '@mini-vue/reactivity';
import { nextTick } from '../src/scheduler';
import { vitest } from 'vitest';
import { watchEffect } from '../src/apiWatch';

describe('api: watch', () => {
  it('effect', async () => {
    let dummy: number = 0;
    const state = reactive({ count: 1 });
    watchEffect(() /* watchEffectCallback */ => {
      dummy = state.count;
    });

    // watchEffect 会先执行一次 watchEffectCallback
    expect(dummy).toBe(1);

    // 响应式对象的值变化的时候再次执行 watchEffectCallback
    state.count = 2;
    await nextTick();

    // watchEffectCallback 默认是在视图更新之前执行的
    // 更新是是异步的, 所以必须先执行 nextTick, 才能正
    // 确的获取到值
    expect(dummy).toBe(2);
  });

  it('stopping the watcher (effect)', async () => {
    let dummy: number = 0;
    const state = reactive({ count: 1 });
    const stop: CallableFunction = watchEffect(() /* watchEffectCallback */ => {
      dummy = state.count;
    });
    expect(dummy).toBe(1);

    // 调用停止方法后, 不再监听 watch -> 清空 effect 依赖
    stop();
    state.count = 2;
    await nextTick();

    // 所以此时是 1, 那就证明没有再次调用 watchEffectCallback
    expect(dummy).toBe(1);
  });

  it('cleanup registration (effect)', async () => {
    let dummy: number = 0;
    const state = reactive({ count: 1 });

    // 在初始化时不会调用, 但是在更新的时候会调用
    const cleanupCallback = vitest.fn();

    const stop: CallableFunction = watchEffect((onCleanup: CallableFunction) /* watchEffectCallback */ => {
      onCleanup(cleanupCallback);
      dummy = state.count;
    });

    // 第一次初始化会执行 watchEffectCallback
    expect(dummy).toBe(1);

    state.count = 2;
    await nextTick();

    // 再次修改 dummy 的时候, 会调用 cleanupCallback
    expect(cleanupCallback).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(2);

    // 停止监听的时候, 也会调用 cleanupCallback
    stop();
    expect(cleanupCallback).toHaveBeenCalledTimes(2);
  });
});
