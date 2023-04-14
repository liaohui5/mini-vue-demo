import { getCurrentInstance } from './component';

export function provide(key: string, value: any): void {
  // set value to provides
  const instance = getCurrentInstance() as ComponentInstance;
  if (!instance) return;
  const { parent, provides } = instance;
  let parentProvides: null | object = null;
  if (parent) {
    parentProvides = parent.provides;
  }

  // 因为 provides 在 createComponentInstance 中初始化的时候, 必定是一个对象
  // 如果是根组件: 那么就没有 parent, parent 是 null, 那么他的 provides 就是 {}
  // 如果不是根组件: 那么就会有 parent, 那么他的 provides 就是 parent.provides
  // 此时: 如果是第一次进入那么他的 provides 和 parent.provides 一定是同一个对
  // 象, 那么只需要重新给 instance.provides 赋值一个继承自 parent.provides 的
  // 新对象, 这样的话, 既可以实现隔离的效果, 在当前组件中 provides 的不会影响到
  // 父组件的 provides, 又可以让当前组件的子组件获取到 当前组件 parent 的 provides
  // App          ->              Home               ->             Demo
  // provide('foo', 1)            provide('foo', 5)                 let foo = inject('foo') // 5
  // provide('bar', 2)                                              let bar = inject('bar') // 2
  // App  provides: {foo:1, bar: 2 }
  // Home provides: {foo:5, [prototype]: { foo:1, bar:2 }}
  if (Object.is(parentProvides, provides)) {
    instance.provides = Object.create(parentProvides);
  }
  Reflect.set(instance.provides, key, value);
}

export function inject(key: string, defaultValue?: any): any {
  // get value from instance.parent.provides
  const instance = getCurrentInstance();
  if (instance && parent.parent) {
    return Reflect.get(instance.parent!.provides, key) || defaultValue;
  }
}
