/**
 * 判断一个值是否是一个对象
 * @param value {any}
 * @returns {boolean}
 */
export function isObject(value: any): boolean {
  return value !== null && typeof value === 'object';
}

/**
 * 判断一个值是否是一个字符串
 * @param value {any}
 * @returns {boolean}
 */
export const isString = (value: any): boolean => typeof value === 'string';

/**
 * 判断一个 key 是否在对象上存在
 * @param value {object}
 * @param key {string}
 * @returns {boolean}
 */
export const hasOwnKey = (value: object, key: string | symbol): boolean => {
  return Object.prototype.hasOwnProperty.call(value, key);
};

/**
 * 判断一个值是否是一个函数
 * @param value {any}
 * @returns {boolean}
 */
export function isFunction(value: any): boolean {
  return typeof value === 'function';
}

/**
 * 合并对象
 */
export const extend = Object.assign;

/**
 * 比较两个对象的值
 */
export function hasChanged(oldVal: any, newVal: any): boolean {
  return !Object.is(oldVal, newVal);
}

/**
 * 给对象定义私有属性
 * @param target {object}
 * @param key {string|symbol}
 */
export function definePrivateProp(target: object, key: string | symbol, value: any): void {
  Object.defineProperty(target, key, {
    writable: false,
    configurable: false,
    enumerable: false,
    value,
  });
}

/**
 * 判断对象是否是空对象
 * @param value
 * @returns {boolean}
 */
export function isEmptyObject(value: object): boolean {
  return Object.keys(value).length === 0;
}

