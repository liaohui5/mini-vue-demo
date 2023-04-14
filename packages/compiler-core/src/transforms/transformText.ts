import { createCompoundExpression, NodeTypes } from '../ast';
import { isText } from '../utils';

export function transformText(node: ASTNode) {
  // 文本节点才可能包含其他节点类型
  if (node.type !== NodeTypes.ELEMENT) {
    return;
  }

  return () => {
    const children = node.children!;
    let compound: CompoundASTNode | undefined;

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!isText(child)) {
        continue;
      }

      for (let j = i + 1; j < children.length; j++) {
        // 为了替换当前 text 节点为 compound_express
        const next = children[j];
        if (!isText(next)) {
          // 停止收集
          compound = undefined;
          break;
        }
        if (!compound) {
          // 初始化
          compound = children[i] = createCompoundExpression([child]);
        }

        // 添加其他子节点到 compound
        compound.children.push('+');
        compound.children.push(next);

        // 改变数组长度后, 应该让 j--, 否则可能会越界报错
        children.splice(j, 1);
        j--;
      }
    }
  };
}
