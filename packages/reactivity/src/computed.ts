import { ReactiveEffect } from './effect';

class ComputedRef {
  private _value: any;
  private _isCalculated: boolean = false; // 是否已经计算过
  private _effect: ReactiveEffect;

  constructor(getter: CallableFunction) {
    // 利用 scheduler 的特性, 不要让 getter
    // 重复执行, 而是去执行 scheduler
    // 如果执行了 scheduler, 证明数据的值被改变了
    // 需要重新计算, 那么只需要将 _isCalculated 修
    // 改为 false, 下次再 get value 的时候, 就会重
    // 新执行 run 函数, 也就是会执行 getter
    this._effect = createReactiveEffect(getter, () => {
      if (this._isCalculated) {
        this._isCalculated = false;
      }
    });
  }

  get value() {
    if (!this._isCalculated) {
      // 执行 run 就会执行 getter, 所以能获取到结果
      this._value = this._effect.run();
      this._isCalculated = true;
    }
    return this._value;
  }
}

// 创建 ReactiveEffect
function createReactiveEffect(getter: CallableFunction, scheduler: CallableFunction) {
  const reactiveEffect = new ReactiveEffect(getter);
  reactiveEffect.scheduler = scheduler;
  return reactiveEffect;
}

// 创建 computed
export function computed(getter: CallableFunction): ComputedRef {
  return new ComputedRef(getter);
}
