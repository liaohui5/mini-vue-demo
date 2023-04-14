import { createComponentInstance, setupComponent } from './component';
import { shouldUpdateComponent } from './componentUpdateUtils';
import { createAppAPI } from './createApp';
import { queueJobs } from './scheduler';
import { Fragment, Text } from './vnode';
import { isEmptyObject, isObject, ShapeFlags } from '@mini-vue/shared';
import { effect } from '@mini-vue/reactivity';

/**
 * 获取最长递增子序列(返回key) LIS
 * 传入: [6,3,5,8,4,9] 输出: 1,2,3,5 -> 其对应的值就是 3,5,8,9
 * 找最长的数值往上增的子序列
 */
function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i: number, j: number, u: number, v: number, c: number;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}

/**
 * 创建渲染器
 * @param options
 * @returns { object: {{createApp: Function}} }
 */
export function createRenderer(options: createRendererOptions): { createApp: CallableFunction } {
  const {
    createElement: hostCreateElement,
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    setTextContent: hostSetTextContent,
  } = options;

  // 渲染
  function render(vnode: VNode, container: Element): void {
    /* @ts-ignore */
    patch(null, vnode, container, null);
  }

  // 如果是组件就处理组件, 是HTML元素就处理元素
  // n1: 更新前的subTree VNode, 如果是初始化, 就是 null
  // n2: 更新后的subTree VNode, 对比不同, 渲染最新的, 完成视图更新
  function patch(
    n1: VNode | null,
    n2: VNode,
    container: Element,
    parentComponent: ComponentInstance,
    anchor?: Element
  ): void {
    const { type, shapeFlag } = n2;
    // fragment -> vnode[]
    if (type === Fragment) {
      processFragment(n1, n2, container, parentComponent);
    }

    // text
    else if (type === Text) {
      processText(n1, n2, container);
    }

    // component
    else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      processComponent(n1, n2, container, parentComponent);
    }

    // element
    else if (shapeFlag & ShapeFlags.ELEMENT) {
      processElement(n1, n2, container, parentComponent, anchor);
    }
  }

  // 处理 Fragment
  function processFragment(n1: VNode | null, n2: VNode, container: Element, parentComponent: ComponentInstance) {
    mountChildren(n2.children as Array<VNode>, container, parentComponent);
  }

  // 处理 Text
  function processText(n1: VNode | null, n2: VNode, container: Element) {
    const textNode = document.createTextNode(n2.children as string);
    n2.el = textNode;
    hostInsert(textNode, container);
  }

  // 处理元素
  function processElement(
    n1: VNode | null,
    n2: VNode,
    container: Element,
    parentComponent: ComponentInstance,
    anchor?: Element
  ) {
    if (!n1) {
      mountElement(n2, container, parentComponent, anchor);
    } else {
      updateElement(n1, n2, parentComponent, anchor);
    }
  }

  // 挂载元素
  function mountElement(vnode: VNode, container: Element, parentComponent: ComponentInstance, anchor?: Element) {
    const { type, props, children, shapeFlag } = vnode;
    const el = (vnode.el = hostCreateElement(<string>type));

    if (isObject(props)) {
      for (const [key, value] of Object.entries(<object>props)) {
        hostPatchProp(el, key, null, value);
      }
    }

    if (ShapeFlags.ARRAY_CHILDREN & shapeFlag) {
      // array children: => h("div", null, [ h('p'), h('p') ])
      mountChildren(<Array<VNode>>children, el, parentComponent);
    } else if (ShapeFlags.TEXT_CHILDREN & shapeFlag) {
      // text children:  => h("div", null, 'hello')
      el.textContent = children as string;
    }
    hostInsert(el, container, anchor);
  }

  // 更新元素
  function updateElement(n1: VNode, n2: VNode, parentComponent: ComponentInstance, anchor?: Element) {
    const oldProps = (n1 && n1.props) || {};
    const newProps = n2.props || {};

    // 由于 mountElement 的时候会给 vnode.el 赋值,
    // 所以更新的时候: 也要给这个新生成的 vnode 的 el 赋值
    const el = (n2.el = n1.el) as Element;
    patchProps(el, oldProps, newProps);
    patchChildren(n1, n2, el, parentComponent, anchor);
  }

  // 更新元素的 props: 不同才需要更新
  function patchProps(el: Element, oldProps: object, newProps: object): void {
    if (oldProps === newProps) {
      return;
    }
    // 更新值: 比较新旧 props 差异, 如果不相等则更新视图
    for (const [key, newValue] of Object.entries(newProps)) {
      const oldValue = Reflect.get(oldProps, key);
      if (oldValue !== newValue) {
        hostPatchProp(el, key, oldValue, newValue);
      }
    }

    // 移除属性: 比较新旧 props, 不存在的属性就要移除
    if (isEmptyObject(oldProps)) {
      return;
    }
    for (const [key, oldValue] of Object.entries(oldProps)) {
      if (!Reflect.has(newProps, key)) {
        hostPatchProp(el, key, oldValue, null);
      }
    }
  }

  // 更新元素的 children
  function patchChildren(
    n1: VNode,
    n2: VNode,
    container: Element,
    parentComponent: ComponentInstance,
    anchor?: Element
  ): void {
    const oldShapeFlag = n1.shapeFlag;
    const newShapFlag = n2.shapeFlag;
    const c1 = n1.children as Array<VNode>;
    const c2 = n2.children as Array<VNode>;

    if (newShapFlag & ShapeFlags.TEXT_CHILDREN) {
      // 新 vnode children 是一个 字符串
      if (oldShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 老 vnode 是一个数组: 先卸载所有子节点,
        // 然后替换为新 vnode 的children字符串
        unmountChildren(c1);
      }
      if (c1 !== c2) {
        // 老 vnode 是一个字符串: 直接判断是否相等,
        // 两个字符串不相等就直接替换(如果是数组肯定不会等于一个字符串)
        hostSetTextContent(container, c2);
      }
    } else {
      // 新 vnode children 是一个数组
      if (oldShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        // 老 vnode children 是一个字符串
        // 先将字符串设置为空, 再挂载新 vnode children 数组
        hostSetTextContent(container, '');
        mountChildren(c2, container, parentComponent);
      } else {
        // 老 vnode children 是一个数组
        // diff 算法对比: 找出最小的更新范围, 不能直接暴力
        // 卸载所有children, 然后挂载所有 children, 性能太差
        // unmountChildren(n1.children); mountChildren(n2.children, container, parentComponent);
        // 找出 新旧 vnode 不同的 children-item, 不同的才需要更新, 相同的忽略就好
        patchKeyedChildren(c1, c2, container, parentComponent, anchor);
      }
    }
  }

  // 找出新旧 vnode 不同点的 children-item 更新
  function patchKeyedChildren(
    c1: Array<VNode>,
    c2: Array<VNode>,
    container: Element,
    parentComponent: ComponentInstance,
    parentAnchor?: Element
  ): void {
    // 是否是否是相同的 vnode
    const isSameVNodeType = (n1: VNode, n2: VNode): boolean => {
      return Boolean(n1.type === n2.type && n1.key === n2.key);
    };

    if (!c1) {
      // 如果是自定义render, 可能会导致 c1 是 undefined
      return;
    }

    const l1 = c1.length;
    const l2 = c2.length;
    let e1 = l1 - 1;
    let e2 = l2 - 1;
    let i = 0;

    // 1. 左侧对比: 找出新旧 vnode 相同的 children-item
    // (a b) c
    // (a b) c d
    while (i <= e1 && i <= e2) {
      const n1 = c1[i] as VNode;
      const n2 = c2[i] as VNode;
      if (isSameVNodeType(n1, n2)) {
        console.info(`[diff:left-patch-1]递归 ${n1.key}`);
        patch(n1, n2, container, parentComponent);
      } else {
        break;
      }
      i++;
    }

    // 右侧对比: 从右向左遍历找出新旧 vnode 相同的 children-item
    // a (b c)
    // d e (b c)
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1] as VNode;
      const n2 = c2[e2] as VNode;
      if (isSameVNodeType(n1, n2)) {
        console.info(`[diff:right-patch-1]递归 ${n1.key}`);
        patch(n1, n2, container, parentComponent);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    if (i > e1 && i <= e2) {
      // 新增节点: 有两种情况
      // 1. 在最后面新增节点
      // 2. 在某一个节点前面新增节点
      const insertPos = e2 + 1;
      const anchor = insertPos < l2 ? <Element>c2[insertPos].el : parentAnchor;
      while (i <= e2) {
        console.info(`[diff-create-1]创建 ${c2[i].key}`, c2[i]);
        patch(null, <VNode>c2[i], container, parentComponent, anchor);
        i++;
      }
    } else if (i > e2 && i <= e1) {
      // 移除节点
      while (i <= e1) {
        console.info(`[diff-remove-1]删除 ${c1[i].key}`, c1[i]);
        hostRemove(c1[i].el);
        i++;
      }
    } else {
      // 两边对比完了之后,然后剩下的就是中间的部分顺序变化
      // 5. unknown sequence
      // [i ... e1 + 1]: a b [c d e j] f g
      // [i ... e2 + 1]: a b [e d c h i] f g
      // i = 2, e1 = 4, e2 = 7
      // 分为 3 种情况:
      // 1.创建新的: 在老的里面不存在, 但是在新的里面存在
      // 2.删除老的: 在新的里面不存在, 但是在老的里面存在
      // 3.移动位置: 节点在新的老的里面都存在, 但是位置不一致

      let s1 = i; // prev starting index
      let s2 = i; // next starting index

      // 建立新的 vnodes 映射表关系: vnode.key => index
      const keyToNewIndexMap = new Map();
      for (let i = s2; i <= e2; i++) {
        keyToNewIndexMap.set(c2[i].key, i);
      }

      // 将要处理的节点
      let patched = 0; // 当前已经处理的节点数量
      let toBePatched = e2 - s2 + 1; // 总共需要处理的节点数量
      let newIndexSoFar = 0; // 当前
      let moved = false; // 是否需要移动节点
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (let i = 0; i < toBePatched; i++) {
        newIndexToOldIndexMap[i] = 0;
      }

      // 判断新节点是否在老的节点列表中存在
      // 如果存在就移动位置, 不存在就移除
      // 先判断老的节点是否有绑定了 key 属性 :key="xx"
      // 如果绑定了key,那么就根据 key 去 keyToNewIndexMap 找
      // 如果没有绑定可以属性, 那么就遍历所有的老节点去找
      // 找到了,就证明新节点在老节点列表中存在, 给 newIndex 赋值
      // 让他换个位置就好了, 而不是重新创建
      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          console.info(`[diff-remove-2]删除 ${prevChild.key}`);
          hostRemove(prevChild.el);
          continue;
        }

        let newIndex: number | undefined;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (let j = s2; j <= e1; j++) {
            if (isSameVNodeType(c2[j], prevChild)) {
              newIndex = j;
              break;
            }
          }
        }

        if (newIndex === undefined) {
          console.info(`[diff-remove-3]删除 ${prevChild.key}`);
          hostRemove(prevChild.el);
        } else {
          // 判断是否需要移动位置
          if (<number>newIndex >= newIndexSoFar) {
            newIndexSoFar = <number>newIndex;
          } else {
            moved = true;
          }

          // 因为左边对比完了, 所以此处的 newIndex, 可能不是从 0 开始算的
          // 所以必须减去 s2 的值
          // 为什么要 i + 1 因为: 在 newIndexToOldIndexMap 中 0 是初始化
          newIndexToOldIndexMap[<number>newIndex - s2] = i + 1;
          console.info(`[diff:middle-patch]递归 ${c2[newIndex].key}`);
          patch(prevChild, c2[<number>newIndex], container, parentComponent);
          patched++;
        }
      }

      // 利用最长递增子序列来优化移动逻辑
      // 因为元素是升序的话，那么这些元素就是不需要移动的
      // 而我们就可以通过最长递增子序列来获取到升序的列表
      // 在移动的时候我们去对比这个列表，如果对比上的话，就说明当前元素不需要移动
      // 通过 moved 来进行优化，如果没有移动过的话 那么就不需要执行算法
      // getSequence 返回的是 newIndexToOldIndexMap 的索引值
      // 所以后面我们可以直接遍历索引值来处理，也就是直接使用 toBePatched 即可
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : [];
      let j = increasingNewIndexSequence.length - 1;
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anchorIndex = nextIndex + 1;
        const anchorDOM = anchorIndex < l2 ? <Element>c2[anchorIndex].el : undefined;
        if (newIndexToOldIndexMap[i] === 0) {
          console.info(`[diff-create-2]创建 ${nextChild.key}`);
          patch(null, nextChild, container, parentComponent, anchorDOM);
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[i]) {
            console.info(`[diff-move-2]移动 ${nextChild.key}`);
            hostInsert(nextChild.el, container, anchorDOM);
          } else {
            j--;
          }
        }
      }
    }
  }

  // 挂载所有的子元素
  function mountChildren(children: Array<VNode>, container: Element, parentComponent: ComponentInstance) {
    for (const item of children) {
      patch(null, item, container, parentComponent);
    }
  }

  // 取消挂载所有子元素
  function unmountChildren(children: Array<VNode>) {
    for (const vnode of children) {
      hostRemove(vnode.el);
    }
  }

  // 处理组件
  function processComponent(n1: VNode | null, n2: VNode, container: Element, parentComponent: ComponentInstance): void {
    if (!n1) {
      mountComponent(n2, container, parentComponent);
    } else {
      updateComponent(n1, n2);
    }
  }

  // 挂载组件
  function mountComponent(initialVNode: any, container: Element, parentComponent: ComponentInstance): void {
    // 初始化的时候给 vnode 的 component 赋值
    const instance = createComponentInstance(initialVNode, parentComponent);
    initialVNode.component = instance;

    // 执行 setupComponent 时候, 会执行组件的 setup 并
    // 处理返回值, 给 instance 挂载一个 proxy
    // 让组件 render 函数执行的时候 this 执行这个 proxy
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
  }

  // 更新组件
  function updateComponent(n1: VNode, n2: VNode) {
    const instance = (n2.component = n1.component as ComponentInstance);
    if (shouldUpdateComponent(n1, n2)) {
      instance.next = n2;
      instance.update!(n1, n2);
    } else {
      // 重置虚拟节点: 保证下次正确更新
      n2.el = n1.el;
      instance.vnode = n2;
    }
  }

  // 更新组件后, 渲染之前需要做的操作
  function updateComponentPreRender(instance: ComponentInstance, next: VNode) {
    instance.vnode = next;
    instance.next = null;
    instance.props = next.props;
  }

  // * 递归渲染组件中所有的组件/HTML元素/fragment/text
  function setupRenderEffect(instance: ComponentInstance, initialVNode: VNode, container: Element) {
    const updateComponent = effect(
      () => {
        const { render, proxy } = instance;
        if (!instance.isMounted) {
          // 初始化挂载
          // 调用组件的 render 函数获取 subTree, 类型是 VNode
          // 此时生成的 subTree 是当前组件 render 函数的返回值
          // 也就是说: 是当前组件所有子元素/子组件的集合
          // const subTree = instance.render.call(<ComponentInstanceProxy>instance.proxy, instance.proxy);
          const subTree = render.call(proxy, proxy);
          console.info('=====[setupRenderEffect-挂载组件]=====');
          instance.subTree = subTree;
          patch(null, subTree, container, instance);
          initialVNode.el = subTree.el;
          instance.isMounted = true; // 初始化挂载完成, 下一次就会走更新逻辑
        } else {
          // 更新
          console.info('=====[setupRenderEffect-更新组件]=====');
          const { vnode, next } = instance;
          if (next) {
            next.el = vnode.el; // 更新 el
            updateComponentPreRender(instance, next);
          }
          const subTree = render.call(proxy, proxy);
          const oldSubTree = instance.subTree; // 上一次初始化时生成的 subTree
          instance.subTree = subTree; // 保证下一次更新的时候获取的 oldSubTree, 就是这次更新时生成的
          patch(oldSubTree, subTree, instance.el, instance.parent!); // 对比不同更新视图
        }
      },
      {
        scheduler() {
          // console.log('update scheduler');
          // https://qq.com
          queueJobs(instance.update!);
        },
      }
    );

    instance.update = updateComponent;
  }

  return {
    createApp: createAppAPI(render),
  };
}
