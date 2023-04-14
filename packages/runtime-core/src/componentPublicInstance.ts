import { hasOwnKey } from '@mini-vue/shared';

// 获取属性Map($el,$data,$options)
const publicPropertiesMap = {
  $el: (i: ComponentInstance) => i.vnode.el,
  $slots: (i: ComponentInstance) => i.slots,
  $props: (i: ComponentInstance) => i.props,
  $emit: (i: ComponentInstance) => i.emit,
};

// 组件实例的 proxy handler
export const publicInstanceProxyHandlers = {
  get({ _: instance }, key: string | symbol) {
    const { setupState, props } = instance;

    // props
    if (hasOwnKey(props, key)) {
      return Reflect.get(props, key);
    }
    // setup state
    else if (hasOwnKey(setupState, key)) {
      return Reflect.get(setupState, key);
    }
    // other properties
    else {
      const propertyGetter = Reflect.get(publicPropertiesMap, key);
      if (propertyGetter) {
        return propertyGetter(instance);
      }
    }
  },
  // set() { }
};
