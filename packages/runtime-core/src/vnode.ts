import { ShapeFlags } from '@mini-vue/shared';
import { isObject } from '@mini-vue/shared';

// 根据 type 设置 shapeFlag
function getShapeFlag(type: VNodeType): number {
  return isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : ShapeFlags.ELEMENT;
}

export const Fragment = Symbol('Fragment');
export const Text = Symbol('Text');

// 创建虚拟节点
export function createVNode(type: VNodeType, props?: object | null, children?: VNodeChildren): VNode {
  const vnode: VNode = {
    type,
    props,
    /* @ts-ignore */
    key: props && props.key,
    children,
    el: null,
    shapeFlag: getShapeFlag(type),
  };

  if (typeof children === 'string') {
    // string
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    // array
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  } else if (isObject(children) && vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    // object
    vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
  }

  return vnode;
}

// createVNode 别名
export const h = createVNode;
export const createElementVNode = createVNode;

// 创建文本虚拟节点
export function createTextVNode(text: string) {
  return h(Text, null, text);
}
