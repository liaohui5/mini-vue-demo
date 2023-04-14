import { emit } from './componentEmit';
import { initProps } from './componentProps';
import { publicInstanceProxyHandlers } from './componentPublicInstance';
import { initSlots } from './componentSlots';
import { Fragment, h } from './vnode';
import { proxyRefs, shallowReadonly } from '@mini-vue/reactivity';
import { isFunction, isObject } from '@mini-vue/shared';

// 创建组件实例
export function createComponentInstance(vnode: VNode, parent?: ComponentInstance): ComponentInstance {
  const instance: ComponentInstance = {
    vnode,
    type: vnode.type,
    proxy: null,
    props: {},
    slots: {},
    subTree: null,
    isMounted: false,
    setupState: {},
    parent,
    provides: parent ? parent.provides : {},
    emit: Function.prototype,
    next: null,
    render: () => h(Fragment, null, []),
  };

  // if (vnode.type.name) {
  //   instance.__tag__ = vnode.type.name;
  // }

  instance.emit = emit.bind(null, instance);

  return instance;
}

// 启动组件
export function setupComponent(instance: ComponentInstance) {
  const { props, children } = instance.vnode;
  initProps(instance, props);
  /* @ts-ignore */
  initSlots(instance, children);
  setupStatefulComponent(instance);
}

// 有状态的组件
function setupStatefulComponent(instance: ComponentInstance) {
  const component = instance.type as ComponentOptions;
  const proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
  instance.proxy = proxy;

  const { setup } = component;
  if (isFunction(setup)) {
    setCurrentInstance(instance);
    const setupResult = setup!(shallowReadonly(<object>instance.props), {
      emit: instance.emit,
    });

    // getCurrentInstance 只能在 setup 中调用, 所以别忘记清空
    setCurrentInstance(null);
    handleSetupResult(instance, <object>setupResult);
  }
}

// 处理 setup 返回值
function handleSetupResult(instance: ComponentInstance, setupResult: object) {
  // setup 返回值不一样的话，会有不同的处理
  // 看 setupResult 是 render-function 还是 object
  if (isObject(setupResult)) {
    // 在 render 函数中可以直接获取到 ref 的 value
    instance.setupState = proxyRefs(setupResult);
  }

  // 如果是返回一个 render function
  if (isFunction(setupResult)) {
    instance.type.render = setupResult;
  }

  finishSetupInstance(instance);
}

// 处理返回值
function finishSetupInstance(instance: ComponentInstance) {
  const component = instance.type as ComponentOptions;

  console.log('component:', component);
  if (isFunction(component.render)) {
    instance.render = component.render;
  } else {
    instance.render = compiler(component.template || '');
  }
}

// 在 setup 中获取当前组件的 instance
let currentInstance: ComponentInstance | null = null;
export function getCurrentInstance(): ComponentInstance | null {
  return currentInstance;
}

// 设置 currentInstance
function setCurrentInstance(instance: ComponentInstance | null): void {
  currentInstance = instance;
}

// 注册全局的编译器(在入口函数中会直接执行,所以可以直接使用)
let compiler;
export function registerCompiler(_compiler: Function): void {
  compiler = _compiler;
}
