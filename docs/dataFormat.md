## 关卡数据的格式

```
{
    "background": "#feffbd",
    "start": [-2, 1, 7],
    "dests": [[1, 1, 4], [3, 1, -5], [3, 1, 4]],
    "objects": [
        { "type": "Cube", "pos": [0, 0, 4] },
        { "type": "Cube", "pos": [0, 0, 5] },
        { "type": "Cube", "pos": [0, 0, 6] },
        { "type": "Cube", "pos": [0, 0, 7] },
        { "type": "Cube", "pos": [-1, 0, 7] },
        { "type": "Cube", "pos": [-2, 0, 7] },
        { "type": "Cube", "pos": [-1, 1, 7] },
        { "type": "Cube", "pos": [-2, 1, 7] },
        { "type": "Cube", "pos": [1, 1, 4] },
        { "type": "Cube", "pos": [1, 1, -5] },
        { "type": "Cube", "pos": [2, 1, -5] },
        { "type": "Cube", "pos": [3, 1, -5] },
        { "type": "Cube", "pos": [3, 1, 4] },
        { "type": "Drawbox", "pos": [0, 1, 1], "size": [1, 1, 4], "range": [[1], [1], [1, 4]] },
        { "type": "Rotator", "pos": [2, -2, 4], "size": [4, 4], "face": ["+x", "+z"], "direction": 0 }
    ],
    "mirror": {
        "pos": [-2, -3, 1],
        "size": [7, 15, 0],
        "range": [[-4, 10], [1], [1]]
    },
    "appendActions": {
        "init": "showHint 我是Ponder小子,我的红色方块丢失了,请你帮助我找到它们吧\ndelay 1000 showHint 拖动黄色的移动条,使得路径联通,我会自动跑过去",
        "drag": "if dragTimes=0 showHint 这个黄色的移动条可以沿某个方向进行拖动",
        "mirror": "if mirrorTimes=0 showHint 这个镜子可以沿某个方向进行拖动，镜中的物体也能够组成路径",
        "rotate": "if rotateTimes=0 showHint 这个红色的旋转块可以沿着在一平面上旋转",
        "finish_0": "showHint 干的很棒！接下来，现在拖动这个镜子，尝试让Ponder小子与第二个红色方块联通，镜子中被反射的物体也能组成路径",
        "finish_1": "showHint 到最后一步了，现在，旋转这个红色块，使得Ponder小子与第三个红色方块联通。"
    }
}
```