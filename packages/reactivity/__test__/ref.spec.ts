import { effect, reactive, isRef, proxyRefs, ref, unRef } from '../src';

describe('ref', () => {
  it('happy path', () => {
    const numRef = ref(1);
    expect(numRef.value).toBe(1);
  });

  it('ref should be reactive', () => {
    const numRef = ref(1) as { value: number };
    let calls = 0;
    let num = 0;
    effect(() => {
      calls++;
      num = numRef.value;
    });
    expect(calls).toBe(1);
    expect(num).toBe(1);

    numRef.value = 2;
    expect(calls).toBe(2);
    expect(num).toBe(2);
  });

  it('ref object', () => {
    const fooRef = ref({ foo: 1 }) as { value: { foo: number } };
    let num: number = 0;
    effect(() => {
      num = fooRef.value.foo;
    });
    fooRef.value.foo = 3;
    expect(num).toBe(3);
    expect(fooRef.value.foo).toBe(3);
  });

  it('isRef', () => {
    const a = ref(1);
    const user = reactive({
      age: 1,
    });
    expect(isRef(a)).toBe(true);
    expect(isRef(1)).toBe(false);
    expect(isRef(user)).toBe(false);
  });

  it('unRef', () => {
    const a = ref(1);
    expect(unRef(a)).toBe(1);
    expect(unRef(1)).toBe(1);
  });

  it('proxyRefs', () => {
    const user = {
      age: ref(10),
      name: 'tom',
    };
    const proxyUser = proxyRefs(user) as { age: { value: number }; name: string };
    expect(user.age.value).toBe(10);
    expect(proxyUser.age).toBe(10); // 通过 proxyRefs 可以直接访问 ref.value
    expect(proxyUser.name).toBe('tom');

    (proxyUser as any).age = 20; // set
    expect(proxyUser.age).toBe(20); // 通过 proxyRefs 可以直接赋值, 不需要 age.value = xxx
    expect(user.age.value).toBe(20);

    proxyUser.age = ref(10);
    expect(proxyUser.age).toBe(10);
    expect(user.age.value).toBe(10);
  });
});
