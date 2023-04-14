import { NodeTypes, createInterpolationNode, createElementNode, createTextNode, createRootASTNode } from './ast';

// 标签类型
const enum TagType {
  Start,
  End,
}

// 文本内容中 表达式 开始符号/结束符号 {{ message }}
const startDelimiter: string = '{{';
const closeDelimiter: string = '}}';
const startDelimiterLen: number = startDelimiter.length;
const closeDelimiterLen: number = closeDelimiter.length;

/**
 * 解析 html 为 js object
 */
export function baseParse(content: string): RootASTNode {
  const ctx = createParserContext(content);
  return createRootASTNode(parseChildren(ctx, []));
}

// 创建解析 上下文
function createParserContext(content: string): ParseContext {
  return {
    source: content,
  };
}

// 解析所有子节点
function parseChildren(ctx: ParseContext, ancestors: Array<string>): Array<ASTNode> {
  const nodes: Array<ASTNode> = [];
  let node: ASTNode;
  // let i = 0;
  while (!isEnd(ctx, ancestors)) {
    // i++;
    // if (i > 999) {
    //   console.error('----- infnity loop -----');
    //   break;
    // }

    if (ctx.source.startsWith(startDelimiter)) {
      // 解析 {{message}} 插值表达式
      node = parseInterpolation(ctx);
    } else if (isTag(ctx.source)) {
      // 解析 element <div></div>
      node = parseElement(ctx, ancestors);
    } else {
      // 解析文本  abcd
      node = parseText(ctx);
    }
    nodes.push(node);
  }
  return nodes;
}

// 结束解析子节点循环的条件
function isEnd(ctx: ParseContext, ancestors: Array<string>): boolean {
  // 内容解析完毕才结束
  const s = ctx.source;
  if (s.length === 0) {
    return true;
  }

  // TODO: 为什么此处要遍历所有的 ancestors ?
  for (const item of ancestors) {
    if (startsWithEndTagOpen(ctx, item)) {
      return true;
    }
  }

  return false;
}

// 解析文本节点
function parseText(ctx: ParseContext): TextASTNode {
  // 获取内容 && 向后推进
  // 如果遇到 < {{ 就停止解析 text, 应该去解析表达式和子元素
  let endInex = ctx.source.length;
  const endTokens = [startDelimiter, '<'];
  for (const token of endTokens) {
    const tokenIndex = ctx.source.indexOf(token);
    if (tokenIndex !== -1 && endInex > tokenIndex) {
      // endInex > tokenIndex 取最小值,否则回出错: 如 <div>hi,{{msg}}</div>
      // 如果不取最小值, 那么第二次循环的时候会 hi,{{msg}} 当做一个 text 值
      // 到 < 位置才会停下
      endInex = tokenIndex;
    }
  }
  const text = parseTextData(ctx, endInex);
  return createTextNode(text);
}

// 截取文本并且向后推进
function parseTextData(ctx: ParseContext, len: number): string {
  const text = ctx.source.slice(0, len);
  advanceBy(ctx, len);
  return text;
}

// 判断是否是一个标签
function isTag(str: string): boolean {
  return Boolean(str[0] === '<' && /[a-z]/i.test(str[1]));
}

// 解析 element 元素
function parseElement(ctx: ParseContext, ancestors: Array<string>): ElementASTNode {
  const element = parseTag(ctx, TagType.Start) as ElementASTNode;
  ancestors.push(element.tag);
  element.children = parseChildren(ctx, ancestors); // 递归的去解析
  ancestors.pop();

  // 如果结束标签和当前element不一致, 那么证明没有闭合标签
  if (!startsWithEndTagOpen(ctx, element.tag)) {
    throw new Error(`lost close tag:${element.tag}`);
  }

  parseTag(ctx, TagType.End);
  return element;
}

// 判断当前ctx.source的结束标签是否和 ancestors 中的最后一个是同一个标签(开始和结束)
function startsWithEndTagOpen(ctx: ParseContext, tag: string): boolean {
  return ctx.source.startsWith('</') && ctx.source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase();
}

// 解析 html 标签
function parseTag(ctx: ParseContext, type: TagType): ElementASTNode | void {
  const tagReg = /^<\/?([a-z]+)>/i;

  // matches: [ "<div>", "div", index: 0, input: "<div>..." ]
  const matches = tagReg.exec(ctx.source)!;
  const tag = matches[1];
  advanceBy(ctx, matches[0].length);

  // 如果是闭合标签 </div>
  if (type === TagType.End) {
    return;
  }

  return createElementNode(tag);
}

// 解析插值表达式 {{message}}
function parseInterpolation(ctx: ParseContext): InterpolationASTNode {
  // 截取开始符号 {{message}} -> message}}
  advanceBy(ctx, startDelimiterLen);

  // 截取中间内容 {{message}} -> message
  const rawContent = parseTextData(ctx, ctx.source.indexOf(closeDelimiter));
  const content = rawContent.trim();

  // 截取结束符号 }}
  advanceBy(ctx, closeDelimiterLen);
  return createInterpolationNode({
    type: NodeTypes.SIMPLE_EXPRESSION,
    content,
  });
}

// 向后推进, 已经处理过的就移除
function advanceBy(ctx: ParseContext, len: number) {
  ctx.source = ctx.source.slice(len);
}
