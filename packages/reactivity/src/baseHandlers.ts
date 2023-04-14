import { extend, isObject } from '@mini-vue/shared';
import { track, trigger } from './effect';
import { reactive, ReactiveFlags, readonly } from './reactive';

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

// reactive proxy handlers
export const reactiveHandlers = {
  get,
  set,
};

// readonly proxy handlers
export const readonlyHandlers = {
  get: readonlyGet,
  set() {
    console.warn('[readonlyHandlers]readonly can not be modified');
    return true;
  },
};

// shallowReadonly proxy handlers
export const shallowReadonlyHandlers = extend(readonlyHandlers, {
  get: shallowReadonlyGet,
});

// 高阶函数创建 getter, 高度复用
function createGetter(isReadonly: boolean = false, shallow: boolean = false): CallableFunction {
  return function get(target: object, key: string | symbol, recevier: object) {
    const value = Reflect.get(target, key, recevier);

    // 特殊key判断: isReactive/isReadonly/isProxy
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    }
    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }

    // 递归代理所有层级, 如果是 shallow 就不需要递归
    if (isObject(value) && !shallow) {
      // 递归的去代理所有层级的对象
      return isReadonly ? readonly(value) : reactive(value);
    }

    // 收集依赖, 如果是 readonly 就不需要收集
    if (!isReadonly) {
      track(target, key);
    }

    return value;
  };
}

// 高阶函数创建 setter, 高度复用
function createSetter() {
  return function set(target: object, key: string | symbol, value: any, recevier: object) {
    const result = Reflect.set(target, key, value, recevier);

    // 触发依赖执行
    trigger(target, key);
    return result;
  };
}
