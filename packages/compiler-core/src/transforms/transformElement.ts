import { NodeTypes, createVNodeCall } from '../ast';

export function transformElement(node: ASTNode, ctx: TransformContext) {
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      // ctx.helper(CREATE_ELEMENT_VNODE);
      const { tag, props, children } = <ElementASTNode>node;

      const vnodeTag = `'${tag}'`;

      // TODO: 处理 props
      const vnodeProps = props;

      // 处理 children
      let vnodeChildren = null;
      if (children.length === 1) {
        vnodeChildren = children[0];
      }

      /* @ts-ignore */
      node.codegenNode = createVNodeCall(ctx, vnodeTag, vnodeProps, vnodeChildren);
    };
  }
}
