// 是否需要更新组件
export function shouldUpdateComponent(preVNode: VNode, nextVNode: VNode): boolean {
  const { props: prevProps } = preVNode;
  const { props: nextProps } = nextVNode;

  for (const [key, val] of Object.entries(nextProps!)) {
    if (val !== prevProps![key]) {
      return true;
    }
  }
  return false;
}
