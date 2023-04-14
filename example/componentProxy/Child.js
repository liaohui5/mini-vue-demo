import { h } from 'mini-vue';
export default {
  name: 'Child',
  setup() {},
  render(proxy) {
    const self = this;
    return h('div', {}, [
      h(
        'button',
        {
          onClick() {
            console.log(proxy);
            console.log('click');
            proxy.$emit('change', 'aaa', 'bbbb');
            // 使用 this
            console.log(this);
            self.$emit('change', 'ccc', 'ddd');
          },
        },
        'emit'
      ),
    ]);
  },
};
