import { reactive } from './reactive';
import { trackEffects, triggerEffects, isTracking, ReactiveEffect } from './effect';
import { hasChanged, isObject } from '@mini-vue/shared';

// 如果是对象就转换成 reactive 对象
function convert(value: object): object {
  return isObject(value) ? reactive(value) : value;
}

// 触发 ref 依赖执行
function triggerRefEffects(ref: RefImpl) {
  triggerEffects(ref.depset);
}

// 收集 ref 依赖
function trackRefEffects(ref: RefImpl): void {
  isTracking() && trackEffects(ref.depset);
}

class RefImpl {
  private _value: any;
  public _rawValue: any;
  public readonly __v_isRef: boolean = true;
  public depset: Set<ReactiveEffect>;

  constructor(value: any) {
    this._rawValue = value;
    this._value = convert(value);
    this.depset = new Set();
  }

  get value() {
    // 收集 Ref 的依赖
    trackRefEffects(this);
    return this._value;
  }

  set value(newValue) {
    // 只有值改变才修改值, 然后触发依赖执行
    // 注意: 对比的时候必须用 _rawValue, _value 有
    // 可能是 reactive() 的返回值, 对比结果就不对了
    if (hasChanged(newValue, this._rawValue)) {
      this._value = convert(newValue);
      this._rawValue = newValue;
      triggerRefEffects(this);
    }
  }
}

// ref
export function ref(value: any): RefImpl {
  return new RefImpl(value);
}

// isRef
export function isRef(value: any): boolean {
  return Boolean(isObject(value) && value.__v_isRef);
}

// unRef
export function unRef(ref: any) {
  // !!!! ===== 必须返回 value 不能返回 _value ===== !!!!
  // 返回 value 会触发 getter, 返回 _value 不会触发 getter
  // 会导致 proxyToRefs 失效
  return isRef(ref) ? ref.value : ref;
}

// toRef
export function toRef(obj: object, key: string | symbol) {
  return ref(Reflect.get(obj, key));
}

// toRefs
export function toRefs(obj: object): object {
  const objectWithRefs = {};
  for (const [key, value] of Object.entries(obj)) {
    Reflect.set(objectWithRefs, key, ref(value));
  }
  return objectWithRefs;
}

// proxyRefs
const shallowUnwrapHandlers = {
  get(target: object, key: string | symbol, receiver: object) {
    // 无论是不是 ref 值, 都直接返回原值
    return unRef(Reflect.get(target, key, receiver));
  },
  set(target: object, key: string | symbol, newValue: any, receiver: object) {
    // const oldValue = Reflect.get(target, key, receiver);
    const oldValue = target[key];
    if (isRef(oldValue) && !isRef(newValue)) {
      // 老的值是一个 ref && 新的值不是一个 ref
      // return Reflect.set(oldValue, 'value', newValue);
      return (target[key].value = newValue);
    } else {
      return Reflect.set(target, key, newValue, receiver);
    }
  },
};
export function proxyRefs(objectWithRefs: object) {
  return new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
