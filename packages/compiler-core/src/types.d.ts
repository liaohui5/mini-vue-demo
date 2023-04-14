interface ParseContext {
  source: string;
  [key: string]: any;
}

// AST 节点
interface Expression {
  type: number;
  content: string;
}
interface ASTNode {
  type: number;
  helpers: Array<symbol>;
  codegenNode?: ASTNode;
  children?: Array<ASTNode>;
  tag?: string;
  props?: Array<object>;
  content?: string | Expression;
}

type RootASTNode = Required<Pick<ASTNode, 'type' | 'helpers' | 'codegenNode' | 'children'>>;
type ElementASTNode = Required<Pick<ASTNode, 'type' | 'helpers' | 'children' | 'tag'>> & ASTNode;
type TextASTNode = Required<Pick<ASTNode, 'type' | 'helpers'> & Pick<Expression, 'content'>>;
type InterpolationASTNode = Required<Pick<ASTNode, 'type' | 'helpers' | 'content'>>;
type CompoundASTNode = Required<Pick<ASTNode, 'type' | 'helpers' | 'children'>>;

// transform 上下文
interface TransformContext {
  root: ASTNode;
  nodeTransformers: Array<CallableFunction>;
  helpers: Map<symbol, number>;
  helper: (key: symbol) => void;
}

interface TransformOptions {
  nodeTransformers: Array<CallableFunction>;
  [key: string]: any;
}

// codegen 上下文
interface CodegenContext {
  code: string;
  push: (this: CodegenContext, source: string) => void;
  helper: (key: symbol) => string;
  newline: () => void;
}

// 生成器生成的结果字符串
type GenerateResult = Pick<CodegenContext, 'code'>;
