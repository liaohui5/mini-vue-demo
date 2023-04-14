import * as runtimeDOM from '@mini-vue/runtime-dom';
import { registerCompiler } from '@mini-vue/runtime-core';
import { baseCompile } from '@mini-vue/compiler-core';

// 出口文件: 所有暴露给外部用的API都在这里导出
export * from '@mini-vue/reactivity';
export * from '@mini-vue/runtime-core';
export * from '@mini-vue/runtime-dom';

// 注册编译器
function compileToFunction(template: string): Function {
  const { code } = baseCompile(template);
  const render = new Function('Vue', code);
  return render(runtimeDOM);

  // createElementVNode
  // 生成这样的代码, 然后执行, 得到 render 函数, 然后返回 render 函数
  // function (Vue) {
  //     const { toDisplayString:_toDisplayString,createElementVNode:_createElementVNode } = Vue;
  //     return function render(_ctx, cache){return createElementVNode('div',null,'hi,'+_toDisplayString(_ctx.message))}
  // }
}

registerCompiler(compileToFunction);
