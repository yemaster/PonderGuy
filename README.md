# Ponder小子

米哈游《崩坏·星穹铁道》钟表小子解密的复刻版。

## TODO List

1. 镜子的实现
2. 自定义关卡的制作
3. 关卡的json文件在打包后仍能自己修改
4. 更精细的动画和建模

## 安装

```bash
yarn
yarn dev
```

## Build

```bash
yarn build
```

## 更新日志

 - 2024-03-2
   - 关卡设计器初步完成
   - 替换了人物模型
 - 2024-03-01
   - 完成了镜子的制作和相关的寻路算法
   - 修复了加入镜子后寻路不正确的bug
   - 修改了DragControls的注册方式，花销更小，且最多拖动一个滑动条
   - 将level文件夹放到public中，并用axios读取
   - 初步制作了地图设计器
 - 2024-02-28
   - 重写了关卡场景建造的逻辑，使得更易新增关卡
 - 2024-02-27
   - 修复了方块被遮挡仍然加到路径中的bug
 - 2024-02-26
   - 基础功能完成实现