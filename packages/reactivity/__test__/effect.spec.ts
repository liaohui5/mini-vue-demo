import { reactive, effect, stop } from '../src';

describe('effect', () => {
  it('happy path', () => {
    const user = reactive({ age: 1 }) as { age: number };

    let nextAge: number = 0;
    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(2);
  });

  it('effect runner', () => {
    let num = 1;
    let returnValue = 'runner-return-value';

    /* prettier-ignore */
    const runner = effect(/* effectCallback */() => {
      num++;
      return returnValue;
    });

    expect(num).toBe(2);

    const res = runner();

    // num = 3 证明调用 runner 后, 又调用了一次 effectCallback
    expect(num).toBe(3);
    expect(res).toBe(returnValue);
  });

  it('effect scheduer option', () => {
    // 如果 effect 传入了第二个参数的 { schduler } 选项(函数)
    // effect 第一次执行的时候会执行传入的第一个参数 fn
    // 但是: 当响应式对象的值改变的时候, 不会执行第一个参数 fn
    // 而是会执行 scheduler,
    // 如果手动执行 effect 的返回值(runner), 那么就不会执行 scheduler
    // 还是执行 effect 第一个参数 fn

    let num = 0;
    let run: any;
    let runner: any;

    /* prettier-ignore */
    const scheduler = vitest.fn(/* scheduerCallback */() => {
      run = runner;
    });

    const obj = reactive({ foo: 1 }) as { foo: number };

    runner = effect(
      /* effectCallback */ () => {
        num = obj.foo;
      },
      { scheduler }
    );

    // effect执行时, 会调用 effectCallback,
    // 但是不会直接调用 scheduler, 所以 num 的值是 1
    expect(num).toBe(1); // effectCallback 第一次调用

    // 当响应式对象值改变的时候, 触发依赖的时候调用 schuduler 并且
    // 不会再调用 effectCallback, (scheduler 执行: runner 赋值给 run)
    obj.foo = 5;
    expect(scheduler).toBeCalledTimes(1);

    // 手动执行 run 的时候, effectCallback 才会被调用
    run();
    expect(num).toBe(5); // effectCallback 第二次调用
  });

  it('stop', () => {
    let num = 0;
    const obj = reactive({ foo: 1 }) as { foo: number };

    /* prettier-ignore */
    const runner = effect(/* effectCallback */() => {
      num = obj.foo;
    });
    obj.foo = 2;
    expect(num).toBe(2);

    // 调用 stop 之后, 当响应式对象的值发生改变
    // 就不再调用 effectCallback
    stop(runner as any);
    obj.foo = 3;
    expect(num).toBe(2); // 没有修改为3, 证明 stop 生效了

    // 手动调用 runner 就会再次调用 effectCallback
    runner();
    expect(num).toBe(3);
  });

  it('effect onStop', () => {
    let num = 0;
    const data = reactive({ foo: 1 }) as { foo: number };
    const onStop = vitest.fn();
    const runner = effect(
      /* effectCallback */
      () => {
        num = data.foo;
      },
      {
        onStop,
      }
    );
    stop(runner); // should be call onStop
    expect(onStop).toBeCalledTimes(1);
    expect(num).toBe(1);
  });
});
