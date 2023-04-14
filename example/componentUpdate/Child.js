import { h } from 'mini-vue';
export default {
  name: 'Child',
  setup() {},
  render() {
    return h('div', {}, [h('div', {}, 'child' + this.$props.msg)]);
  },
};
