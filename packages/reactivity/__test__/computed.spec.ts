import { computed, reactive } from "../src";

describe('computed', () => {
  it('happy path', () => {
    const data = reactive({ num: 1 }) as { num: number };
    const numGetter = computed(() => data.num + 1) as { value: number };
    expect(numGetter.value).toBe(2);
  });

  it('compute lazy', () => {
    const data = reactive({ foo: 1 }) as { foo: number };

    const getter = vi.fn(() => {
      return data.foo;
    });

    const cData = computed(getter);

    // lazy
    expect(getter).not.toHaveBeenCalled();

    expect(cData.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute again
    cData.value;
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute until needed
    data.foo = 2;
    expect(getter).toHaveBeenCalledTimes(1);

    // now it should compute
    expect(cData.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);

    // should not compute again
    cData.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });
});
