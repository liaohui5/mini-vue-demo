import { h } from 'mini-vue';
export default {
  name: 'Child',
  setup(props, { emit }) {
    emit('change', 'aaaaa', 'bbbbbb');
    // 支持多个 -
    emit('change-page-name', 'start', 'game');
  },
  render() {
    return h('div', {}, 'child');
  },
};
