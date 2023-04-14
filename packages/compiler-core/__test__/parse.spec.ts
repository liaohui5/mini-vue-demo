import { NodeTypes } from '../src/ast';
import { baseParse } from '../src/parse';

describe('parse', () => {
  // 插值表达式
  describe('interpolation', () => {
    it('base parse', () => {
      const expr = '{{message}}';
      const ast = baseParse(expr);
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        helpers: [],
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: 'message',
        },
      });
    });
  });

  // 元素节点
  describe('element', () => {
    it('simple element', () => {
      const ast = baseParse('<div></div>');
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: 'div',
        helpers: [],
        children: [],
      });
    });
  });

  // 文本节点
  describe('text', () => {
    it('simple text', () => {
      const ast = baseParse('hello world');
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.TEXT,
        helpers: [],
        content: 'hello world',
      });
    });
  });

  // 元素 + 文本 + 差值
  test('element + text + interpolation', () => {
    const ast = baseParse('<p>hi,{{msg}}</p>');
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'p',
      helpers: [],
      children: [
        {
          type: NodeTypes.TEXT,
          helpers: [],
          content: 'hi,',
        },
        {
          type: NodeTypes.INTERPOLATION,
          helpers: [],
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'msg',
          },
        },
      ],
    });
  });

  // 嵌套的元素解析
  test('nested element', () => {
    const ast = baseParse('<div><p>hi</p>{{msg}}</div>');
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: 'div',
      helpers: [],
      children: [
        {
          type: NodeTypes.ELEMENT,
          tag: 'p',
          helpers: [],
          children: [
            {
              type: NodeTypes.TEXT,
              helpers: [],
              content: 'hi',
            },
          ],
        },
        {
          type: NodeTypes.INTERPOLATION,
          helpers: [],
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: 'msg',
          },
        },
      ],
    });
  });

  // 如果是双标签但是没有闭合标签应该抛出错误
  test('should be throw when lost close tag', () => {
    const html = '<div><span></div>';
    // baseParse(html);
    expect(() => {
      baseParse(html);
    }).toThrow(/lost\sclose\stag:\w+/);
  });

  // TODO: 如果是双标签但是没有开始标签应该抛出错误

  // test('should be throw when lost close tag', () => {
  //   const html = '<div></span></div>'
  //   baseParse(html);
  //   // expect(() => {
  //   //   baseParse(html);
  //   // }).toThrow(/lost\sclose\stag:\w+/);
  // });
});
