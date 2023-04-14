import { NodeTypes } from '../ast';

export function transformExpression(node: InterpolationASTNode) {
  if (node.type === NodeTypes.INTERPOLATION) {
    node.content = processExpression(<Expression>node.content);
  }
}

// 处理表达式内容
function processExpression(expr: Expression): Expression {
  expr.content = `_ctx.${expr.content}`;
  return expr;
}
