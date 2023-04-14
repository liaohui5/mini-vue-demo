import { isFunction } from '@mini-vue/shared';
import { Fragment, h } from '../vnode';

// 渲染 slots
// 1. 在 initSlots 的时候, 会将 slots 处理为一个对象 { k1: () => [vnode1], k2: () => [vnode2] }
// 2. 在 渲染的时候只需要获取对应的 vnode 拿出来渲染就好了
// 3.
export function renderSlots(slots: object, name: string, props: object): VNode | undefined {
  const slot = Reflect.get(slots, name);
  if (!slot) return;
  if (isFunction(slot)) {
    return h(Fragment, null, slot(props));
  }
}
