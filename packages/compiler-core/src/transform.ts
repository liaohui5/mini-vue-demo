import { isFunction } from '@mini-vue/shared';
import { NodeTypes } from './ast';
import { TO_DISPLAY_STING } from './runtimeHelpers';

// null: 34

/**
 * transform 主要是遍历 ast 生成 render 函数的函数体内容
 */
export function transform(root: RootASTNode, options: TransformOptions = { nodeTransformers: [] }): void {
  const transformContext = createTransformContext(root, options);
  traverseNode(<ASTNode>root, transformContext);
  createRootCodegen(root);

  // 给当前节点赋值 helpers
  root.helpers = [...transformContext.helpers.keys()];
}

// 给 codegen 创建生成代码节点树
function createRootCodegen(root: RootASTNode): void {
  const child = root.children[0];
  if (NodeTypes.ELEMENT === child.type) {
    root.codegenNode = child.codegenNode;
  } else {
    root.codegenNode = child;
  }
}

// 创建 转换上下文
function createTransformContext(root: ASTNode, options: TransformOptions): TransformContext {
  return {
    root,
    nodeTransformers: options.nodeTransformers || [],
    helpers: new Map(),
    helper(key: symbol): void {
      this.helpers.set(key, 1);
    },
  };
}

// 深度优先, 遍历所有节点(树形结构数据)
function traverseNode(node: ASTNode, ctx: TransformContext): void {
  // 因为 transform 可能会修改节点的结构, 所以应该放到后面执行
  // 所以, 应该收集所有后置执行的函数放到最后执行
  const exitCallbacks: Array<CallableFunction> = [];
  for (const transform of ctx.nodeTransformers) {
    const callback = transform(node, ctx);
    isFunction(callback) && exitCallbacks.push(callback);
  }
  // 在遍历子节点节点之前应该先处理自己的 helpers, 方便让 codegen 生成代码
  switch (node.type) {
    case NodeTypes.TEXT:
      break;
    case NodeTypes.INTERPOLATION:
      // 插值表达式用 toDisplayString 显示字符串
      ctx.helper(TO_DISPLAY_STING);
      break;
    case NodeTypes.ROOT:
    case NodeTypes.ELEMENT:
      // 处理 html 元素节点 或者 root 节点 一定有 children
      traverseChildren(ctx, (<RootASTNode>node).children);
      break;

    default:
      break;
  }

  let i = exitCallbacks.length;
  while (i--) {
    exitCallbacks[i]();
  }
}

// 遍历当前节点的子节点
function traverseChildren(ctx: TransformContext, children: Array<ASTNode>): void {
  for (let i = 0; i < children.length; i++) {
    const childNode = children[i];
    // 有 children 一定是处理 element
    traverseNode(<ElementASTNode>childNode, ctx);
  }
}
