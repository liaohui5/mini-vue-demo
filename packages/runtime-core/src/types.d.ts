interface createRendererOptions {
  createElement: (tagName: string) => Element;
  patchProp: (el: Element, key: string, oldValue: any, newValue: any) => void;
  insert: (el: Element, parent: Element, anchor?: Element) => void;
  remove: (el: Element) => void;
  setTextContent: (el: Element, str: string) => void;
}

interface ComponentInstance {
  vnode: VNode;
  type: string | Symbol | ComponentOptions;
  setupState: object;
  proxy: object | null;
  props?: object | null;
  slots: object;
  provides: object;
  parent?: ComponentInstance | null;
  emit: CallableFunction;
  render: (this: ComponentInstanceProxy, ctx: ComponentInstanceProxy) => VNode;
  isMounted: boolean;
  subTree: null | VNode;
  next: VNode | null;
  update?: CallableFunction;
  [key: string]: any;
}

type VNodeType = string | Symbol | ComponentOptions;
type VNodeChildren = object | Array<VNode> | string;
interface VNode {
  type: VNodeType;
  key?: string;
  props?: object | null;
  children?: VNodeChildren;
  component?: ComponentInstance;
  el: null | Element | Text;
  shapeFlag: number;
  [key: string]: any;
}

interface ComponentInstanceProxy {
  $el: null | Element;
  $slots: object | Array<VNode>;
  $props: object;
  [key: string]: any;
}

interface ComponentOptions {
  name?: string;
  template?: string;
  setup?: (props: object, ctx: SetupContext) => CallableFunction | object | void;
  render: (this: ComponentInstanceProxy, ctx: ComponentInstanceProxy) => VNode;
}

interface SetupContext {}
