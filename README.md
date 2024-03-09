# Ponder小子

米哈游《崩坏·星穹铁道》钟表小子解密的复刻版。

## TODO List

1. Ponder小子模型在非Windows平台下加载失败
2. 旋转块和镜子可以同时拖动的问题
3. 开始跑之前有一个动画的寻路效果
4. 碰撞检测

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

 - 2024-03-08
   - 使用indexedDB缓存模型，加快加载速度
   - 修复了刚进入游戏界面过小的问题
   - 游戏界面加了返回的按钮
 - 2024-03-05
   - 随便糊了游戏启动界面，关卡选择界面，帮助界面，关于界面
 - 2024-03-03
   - 修复了更改物体颜色后镜子内物体颜色不变的bug
   - 增加了旋转块旋转的方向
   - 设计器增加了导入功能
   - 修复了设计器去掉镜子后仍有剪切平面的bug
 - 2024-03-02
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