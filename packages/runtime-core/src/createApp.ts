import { h } from './vnode';

export function createAppAPI(render: CallableFunction) {
  return function createApp(rootComponent: ComponentOptions) {
    return {
      mount(rootContainer: any) {
        const vnode = h(rootComponent);
        render(vnode, rootContainer);
      },
    };
  };
}
