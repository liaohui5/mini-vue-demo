// 可以在 setup 中使用 getCurrentInstance 获取组件实例对象
import { h, getCurrentInstance } from 'mini-vue';

export default {
  name: 'App',
  setup() {
    console.log("-------------getCurrentInstance",getCurrentInstance());

    return () => h('div', {}, [h('p', {}, 'getCurrentInstance')]);
  },
};
