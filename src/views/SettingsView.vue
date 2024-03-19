<script setup lang="ts">
// Vue Core
import { appInfo } from '@/base/constants';
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const version = ref(appInfo.version)

document.title = `设置 | Ponder Guy`

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
            <div class="pg-flex" style="width: 100%; justify-content: space-between;">
                <h1 class="pg-header">设置</h1>
                <div style="align-self: flex-end;">
                    <ul class="pg-nav">
                        <li class="pg-nav-item"><a href="javascript:;" class="pg-nav-link" @click="goBack">返回</a></li>
                    </ul>
                </div>
            </div>
            <div class="pg-divider"></div>
            <hr />
            <p>
                Ponder Guy. App Version: {{ version }}. by <a href="https://github.com/yemaster"
                    target="_blank">yemaster</a>.
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