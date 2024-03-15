<script setup lang="ts">
// Vue Core
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

document.title = `玩法帮助 | Ponder Guy`

const fog = ref()
const cover = ref()
onMounted(() => {
    fog.value.style.opacity = "1"
})

const router = useRouter()

function goBack() {
    cover.value.style.visibility = "visible"
    cover.value.style.opacity = "1"
    setTimeout(() => { router.push(`/game/list`) }, 500)
}
</script>

<template>
    <div class="cover" ref="cover"></div>
    <div class="gs" ref="fog">
        <div class="pg-container">
            <h1 class="pg-header">玩法帮助</h1>
            <ul class="pg-nav">
                <li class="pg-nav-item"><a href="javascript:;" class="pg-nav-link" @click="goBack">返回</a></li>
            </ul>
            <div class="pg-divider"></div>
            <p>本游戏是《崩坏·星穹铁道》中梦境迷钟解谜的复刻版本。未来可能会加入更多玩法。</p>
            <p>游戏目标：用鼠标操作方块，使得Ponder小子和红色方块之间的路径联通。</p>
            <p>方块类型和操作说明：
            <ul>
                <li>普通方块: 不可以操纵</li>
                <li>滑动条: 可以用鼠标拖动，进行平移</li>
                <li>旋转块：可以绕轴进行旋转</li>
                <li>镜子：反射镜子前的方块，镜子中的方块依然可以构成路径。可以用鼠标拖动，进行平移</li>
            </ul>
            </p>
            <p>画面操作说明：
            <ul>
                <li>鼠标左键：可以拖动滑动条和镜子，可以旋转旋转块</li>
                <li>鼠标滚轮，可以滚动来缩放页面大小</li>
                <li>鼠标右键：可以平移页面</li>
            </ul>
            </p>
            <p>当操作方块使得Ponder小子和红色方块联通时，无需其他操作，Ponder小子会自动走到红色方块处。并显示下一红色方块或者通关。</p>
        </div>
    </div>
</template>

<style scoped>
.gs {
    font-family: "genshin";

    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: auto;

    background-color: rgba(255, 255, 255, .85);
    backdrop-filter: blur(3px);
    opacity: 0;

    transition: opacity .5s;

    z-index: 1;
}
</style>