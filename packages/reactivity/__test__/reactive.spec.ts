import { effect, isReactive, reactive } from '../src';

describe('reactive object', () => {
  it('reactive happy path', () => {
    const original = {
      id: 1,
    };
    const observed = reactive(original) as { id: number };

    // 返回的代理对象与被代理对象不是一个引用
    expect(observed).not.toBe(original);

    // 代理对象获取的值与被代理对象获取的值是一样的
    expect(observed.id).toBe(original.id);

    // isReactive 能够正确的检测 original 和 observed
    expect(isReactive(observed)).toBe(true);
    expect(isReactive(original)).toBe(false);
  });

  it('reactive deep proxy', () => {
    const obj = reactive({
      id: 1,
      name: {
        firstName: 'Mark',
        lastName: 'Jerry',
      },
    }) as { id: number; name: { firstName: string; lastName: string } };

    const effectCallback = vi.fn();
    effect(effectCallback);

    obj.name.lastName = 'Tom';
    expect(effectCallback).toBeCalled();
  });
});
