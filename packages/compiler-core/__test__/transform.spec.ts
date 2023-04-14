import { NodeTypes } from '../src/ast';
import { baseParse } from '../src/parse';
import { transform } from '../src/transform';

describe('transform', () => {
  it('happy path', () => {
    const ast = baseParse('<div>hi,{{message}}</div>');

    const plugin = (node: ASTNode) => {
      if (node.type === NodeTypes.TEXT) {
        (<TextASTNode>node).content += 'mini-vue';
      }
    };

    transform(ast, {
      nodeTransformers: [plugin],
    });

    /* @ts-ignore */
    const textASTNode = ast.children[0].children[0] as TextASTNode;
    expect(textASTNode.content).toBe('hi,mini-vue');
  });
});
