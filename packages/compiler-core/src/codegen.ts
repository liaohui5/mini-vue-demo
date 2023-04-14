import { isString } from '@mini-vue/shared';
import { NodeTypes } from './ast';
import { CREATE_ELEMENT_VNODE, helperNameMapper, TO_DISPLAY_STING } from './runtimeHelpers';

/**
 * 负责生成 render 函数
 */
export function generate(ast: RootASTNode): GenerateResult {
  const ctx = createCodegenContext();
  const fnName = 'render';
  const args = ['_ctx', 'cache'].join(', ');

  // 生成导入代码 const { xxx } = xxx
  genFunctionPreamble(ast, ctx);

  // 生成函数体
  ctx.push(`return function ${fnName}(${args}){return `);
  genNode(ast.codegenNode, ctx);
  ctx.push('}');

  return {
    code: ctx.code,
  };
}

// 生成render函数代码上下文
function createCodegenContext(): CodegenContext {
  return {
    code: '',
    helper(key: symbol): any {
      return helperNameMapper[key];
    },
    push(source: string): void {
      this.code += source;
    },
    newline(): void {
      this.code += '\n';
    },
  };
}

// 根据不同的 node 类型去执行不同的处理犯法
function genNode(node: ASTNode, ctx: CodegenContext): void {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(<TextASTNode>node, ctx);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(<InterpolationASTNode>node, ctx);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(<Expression>node, ctx);
      break;
    case NodeTypes.ELEMENT:
      genElement(<ElementASTNode>node, ctx);
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(<CompoundASTNode>node, ctx);
      break;
    default:
      throw new TypeError(`[codegen]not support ast node type:${node.type}`);
  }
}

// 生成代码导入逻辑
function genFunctionPreamble(ast: ASTNode, ctx: CodegenContext) {
  if (ast.helpers.length > 0) {
    const vueBinging = 'Vue';
    const imports = ast.helpers
      .map((helper: symbol, _index: number, _array: Array<symbol>): string => {
        const helperName = ctx.helper(helper);
        return `${helperName}:_${helperName}`;
      })
      .join(',');

    // 生成 imports 代码: aaa:_aaa, bbb:_bbb
    ctx.push(`const { ${imports} } = ${vueBinging};`);
    ctx.newline();
  }
}

// 文本节点处理
function genText(node: TextASTNode, ctx: CodegenContext): void {
  ctx.push(`'${node.content}'`);
}

// 插值表达式节点处理
function genInterpolation(node: InterpolationASTNode, ctx: CodegenContext): void {
  ctx.push(`_${ctx.helper(TO_DISPLAY_STING)}(`);
  genNode(<ASTNode>node.content, ctx); // -> genExpression -> 将所有逻辑都交给 genNode -> 其他方法只负责生成
  ctx.push(')');
}

// 处理插值表达式的表达式内容
function genExpression(node: Expression, ctx: CodegenContext): void {
  ctx.push(node.content);
}

// 处理元素节点
function genElement(node: ElementASTNode, ctx: CodegenContext): void {
  const { tag, props, children } = node;
  // 最终拼接成一个 createElement('tag', props, children) 的格式;
  ctx.push(`_${ctx.helper(CREATE_ELEMENT_VNODE)}(`);
  const nodes = genNullable([tag, props, children]);
  genNodeList(nodes, ctx);
  ctx.push(')');
}

// 生成
function genNodeList(nodes: Array<ASTNode | string>, ctx: CodegenContext) {
  for (let i = 0, len = nodes.length; i < len; i++) {
    const node = nodes[i];
    if (isString(node)) {
      ctx.push(<string>node); // tag & props
    } else {
      genNode(<ASTNode>node, ctx); // children
    }
    // 最后一个元素不需要加 , createElementVNode('tag', [props], children)
    if (i < len - 1) {
      ctx.push(',');
    }
  }
}

// 如果值为假就为 'null'
function genNullable(args: Array<any>): Array<any> {
  return args.map((arg) => arg || 'null');
}

// 处理复合表达式
function genCompoundExpression(node: CompoundASTNode, ctx: CodegenContext): void {
  for (const child of node.children) {
    if (isString(child)) {
      /* @ts-ignore */
      ctx.push(<string>child);
    } else {
      genNode(child, ctx);
    }
  }
}
