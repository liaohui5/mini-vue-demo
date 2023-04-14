import { ShapeFlags } from '@mini-vue/shared';

// 初始化插槽
export function initSlots(instance: ComponentInstance, children: VNodeChildren) {
  const { slots, vnode } = instance;
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    // 序列化(格式化) slot 的格式
    normalizeObjectSlots(slots, children);
  }
}

// 初始化成对象格式的 slots 数据
// 如果 children 是对象 { k1: vnode1, k2: vnode2 }
// 如果 children 是数组 [ vnode1, vnode2 ] -> { 0: vnode1, 1: vnode2 }
// 最终变成对象的格式(实现具名插槽)
// object  =>  { k1: [vnode1], k2: [vnode2] }
// array   =>  { 0: [vnode1], 1: [vnode2] }
function normalizeObjectSlots(slots: object | Array<any>, children: VNodeChildren): void {
  for (const [key, val] of Object.entries(children)) {
    const slot = (props: object) => normalizeSlotValue(val(props));
    Reflect.set(slots, key, slot);
  }
}

// 格式化 slot 数据的值, 必须是 数组格式
function normalizeSlotValue(val: any): Array<any> {
  return Array.isArray(val) ? val : [val];
}
