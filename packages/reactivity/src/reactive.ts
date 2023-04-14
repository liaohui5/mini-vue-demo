import { reactiveHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandlers';

// 特殊的 key, 用于判断
export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
}

// 缓存, 如果已经存在就直接获取, 不要重新创建
export const reactiveMap = new WeakMap();
export const readonlyMap = new WeakMap();

// 创建响应式 proxy 对象
function createReactiveObject(target: object, handlers: object, cacheMap: WeakMap<object, any>) {
  let existingProxy = cacheMap.get(target);
  if (!existingProxy) {
    existingProxy = new Proxy(target, handlers);
    cacheMap.set(target, existingProxy);
  }
  return existingProxy;
}

// 创建一个响应式对象
export const reactive = <T extends object>(target: T): T => {
  return createReactiveObject(target, reactiveHandlers, reactiveMap);
};

// 创建一个只读的 proxy 对象
export const readonly = <T extends object>(target: T): T => {
  return createReactiveObject(target, readonlyHandlers, readonlyMap);
};

// 创建一个浅层次的只读 proxy 对象
export const shallowReadonly = (target: object): object => {
  return createReactiveObject(target, shallowReadonlyHandlers, readonlyMap);
};

// 是否是 reactive 对象
export const isReactive = (value: any): boolean => {
  return Boolean(value && value[ReactiveFlags.IS_REACTIVE]);
};

// 是否是 readonly 对象
export const isReadonly = (value: any): boolean => {
  return Boolean(value && value[ReactiveFlags.IS_READONLY]);
};

// 是否是 proxy 对象
export const isProxy = (value: any): boolean => {
  return isReadonly(value) || isReactive(value);
};
