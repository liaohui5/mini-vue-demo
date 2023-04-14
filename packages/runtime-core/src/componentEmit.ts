// 初始化事件触发器 emit
export function emit(instance: ComponentInstance, event: string, ...args: Array<any>) {
  // 将一个 kebab 字符串(a-b) 转驼峰命名法(aB)
  const camelize = (str: string): string => {
    return str.replace(/-(\w)/g, (_: string, char: string) => {
      return char ? char.toLowerCase() : '';
    });
  };

  // 将一个字符串首字母大写
  const capitalize = (str: string): string => {
    if (str.length === 0) return '';
    return str.charAt(0).toUpperCase() + str.substring(1);
  };

  // 给一个字符串变成onXX格式, 如 click -> onClick
  const toHandlerKey = (str: string): string => {
    return str ? 'on' + capitalize(str) : '';
  };

  const handlerKey = toHandlerKey(camelize(event));
  const handler = Reflect.get(instance.props, handlerKey);
  handler && handler.call(instance.proxy, ...args);
}
