import { generate } from './codegen';
import { baseParse } from './parse';
import { transform } from './transform';
import { transformElement } from './transforms/transformElement';
import { transformExpression } from './transforms/transformExpression';
import { transformText } from './transforms/transformText';

export function baseCompile(template: string): GenerateResult {
  const ast = baseParse(template);

  transform(ast, {
    nodeTransformers: [transformExpression, transformElement, transformText],
  });

  return generate(ast);
}
