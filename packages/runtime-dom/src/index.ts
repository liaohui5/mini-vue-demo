import { createRenderer } from '@mini-vue/runtime-core';

// 创建节点
function createElement(type: string): Element {
  return document.createElement(type)!;
}

// 更新属性
function patchProp(el: Element, key: string, oldValue: any, newValue: any): void {
  if (oldValue === newValue) {
    return;
  }
  const isOn = (str: string) => /^on[A-Z]/.test(str);
  if (isOn(key)) {
    // event
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, newValue);
  } else {
    // attributes
    if ([undefined, null].includes(newValue)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, newValue as string);
    }
  }
}

// 插入节点到指定为止
function insert(el: Element, parent: Element, anchor?: Element) {
  parent.insertBefore(el, anchor || null);
}

// 移除节点
function remove(el: Element) {
  el.remove();
}

// 设置节点文本内容
function setTextContent(el: Element, str: string) {
  el.textContent = str;
}

// 创建 render 函数的高阶函数
const renderer = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setTextContent,
});

// createApp
export const createApp = renderer.createApp;
export * from '@mini-vue/runtime-core';
