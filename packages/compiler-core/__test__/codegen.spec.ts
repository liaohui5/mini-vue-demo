import { generate } from '../src/codegen';
import { baseParse } from '../src/parse';
import { transformElement } from '../src/transforms/transformElement';
import { transformExpression } from '../src/transforms/transformExpression';
import { transformText } from '../src/transforms/transformText';
import { transform } from '../src/transform';

describe('codegen', () => {
  it('happy path', () => {
    const ast = baseParse('hi');
    transform(ast);
    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  });

  it('interpolation', () => {
    const ast = baseParse('{{message}}');

    transform(ast, {
      nodeTransformers: [transformExpression],
    });

    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  });

  it('element', () => {
    const ast = baseParse('<div></div>');
    transform(ast, {
      nodeTransformers: [transformElement],
    });
    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  });

  it('element + text + interpolation', () => {
    const ast = baseParse('<div>hi,{{message}}</div>');

    transform(ast, {
      nodeTransformers: [transformExpression, transformElement, transformText],
    });

    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  });
});
