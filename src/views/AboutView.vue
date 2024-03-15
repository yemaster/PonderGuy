<script setup lang="ts">
// Vue Core
import { appInfo } from '@/base/constants';
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const version = ref(appInfo.version)

document.title = `关于本项目 | Ponder Guy`

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
      <h1 class="pg-header">关于Ponder小子</h1>
      <ul class="pg-nav">
        <li class="pg-nav-item"><a href="javascript:;" class="pg-nav-link" @click="goBack">返回</a></li>
      </ul>
      <div class="pg-divider"></div>
      <p>本游戏是《崩坏·星穹铁道》中梦境迷钟解谜的复刻版本。未来可能会加入更多玩法。</p>
      <p>由<a href="https://github.com/yemaster" target="_blank">yemaster</a>开发，Github地址：<a
          href="https://github.com/yemaster/PonderGuy" target="_blank">https://github.com/yemaster/PonderGuy</a></p>
      <p>使用到的开源软件或者资源：
      <ul>
        <li>前端框架：<a href="https://cn.vuejs.org/" target="_blank">Vue 3</a></li>
        <li>3D库：<a href="https://threejs.org/" target="_blank">threejs</a></li>
        <li>3D模型及动画：<a href="https://www.mixamo.com" target="_blank">mixamo</a></li>
        <li>部分字体：MyriadPro、汉仪文黑-85W(来自原神)</li>
      </ul>
      部分参考：<a href="https://juejin.cn/post/7067122410457137165"
        target="_blank">https://juejin.cn/post/7067122410457137165</a>
      镜子的实现参考：<a href="https://www.bilibili.com/video/BV1kJ4m1W76K/"
        target="_blank">https://www.bilibili.com/video/BV1kJ4m1W76K/</a>
      </p>
      <hr />
      <p>
        Ponder Guy. App Version: {{ version }}. by <a href="https://github.com/yemaster" target="_blank">yemaster</a>.
      </p>
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