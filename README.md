## mini-vue 实现 + 笔记

大崔哥的 [mini-vue](https://github.com/cuixiaorui/mini-vue) 实现, 大体上和大崔的实现一致, 但是也有少许不同

有一些注释是我自己的理解, 有的 types.d.ts 是我自己写的, 课程中并没有实现

打包方式不太一样, 我用的是 vite 课程视频中用的是 rollup, 还有有一些测试是我自己写的, 是不是照抄的

## 三大模块

- [x] reactivity
- [x] runtime-core + runtime-dom
- [x] compiler-core

## 快速开始

```bash
git clone https://github.com/liaohui5/mini-vue-demo

cd mini-vue-demo

npm run build

npm run dev

# 注意路径
open http://localhost:8080/example/helloWorld
```

## TODO

- [ ] 解决 vite 打包 esm 的文件没有压缩的问题 [issue](https://github.com/vitejs/vite/issues/8848)
