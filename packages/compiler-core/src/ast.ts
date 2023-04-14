import { CREATE_ELEMENT_VNODE } from './runtimeHelpers';

export const enum NodeTypes {
  // 差值表达式
  INTERPOLATION,

  // 简单表达式
  SIMPLE_EXPRESSION,

  // 复合类型表达式
  COMPOUND_EXPRESSION,

  // 元素
  ELEMENT,

  // 文本
  TEXT,

  // 根节点
  ROOT,
}

// 创建根节点
export function createRootASTNode(children: Array<ASTNode>): RootASTNode {
  return {
    type: NodeTypes.ROOT,
    children,
    codegenNode: children[0],
    helpers: [],
  };
}

// 创建插值表达式节点
export function createInterpolationNode(content: Expression): InterpolationASTNode {
  return {
    type: NodeTypes.INTERPOLATION,
    content,
    helpers: [],
  };
}

// 创建复合表达式节点
export function createCompoundExpression(children: Array<ASTNode>): CompoundASTNode {
  return {
    type: NodeTypes.COMPOUND_EXPRESSION,
    children: children,
    helpers: [],
  };
}

// 创建元素表达式节点
export function createElementNode(tag: string): ElementASTNode {
  return {
    type: NodeTypes.ELEMENT,
    tag,
    children: [],
    helpers: [],
  };
}

// 创建文本节点
export function createTextNode(text: string): TextASTNode {
  return {
    type: NodeTypes.TEXT,
    content: text,
    helpers: [],
  };
}

// 创建 元素节点
export function createVNodeCall(ctx: TransformContext, tag: string, props: any, children: Array<any>) {
  ctx.helper(CREATE_ELEMENT_VNODE);
  return {
    type: NodeTypes.ELEMENT,
    helpers: [],
    children,
    tag,
    props,
  };
}
