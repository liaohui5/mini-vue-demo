import { NodeTypes } from "./ast";

// 是否是 文本 或者 表达式节点
export function isText(node: ASTNode): boolean {
  return [NodeTypes.TEXT, NodeTypes.INTERPOLATION].includes(node.type);
}
