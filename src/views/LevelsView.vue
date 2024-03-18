<script setup lang="ts">
// Vue Core
import { onMounted, ref, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Axios
import axios from '@/base/axios'
document.title = `关卡选择 | Ponder Guy`

let baseURL = import.meta.env.BASE_URL
if (baseURL === "/")
    baseURL = ""


const fog = ref()
const cover = ref()
onMounted(() => {
    fog.value.style.opacity = "1"
})

const route = useRoute()
const router = useRouter()

type levelInfo = {
    "name": string,
    "img": string
}

const level_list: Ref<levelInfo[]> = ref([])
const now_level = ref(0)
axios.get("/levels/list.json").then(res => {
    const level_data = res.data
    level_list.value = level_data.levels

    let tmp = Number(route.query.level)
    if (!((tmp >= 0 && tmp < level_list.value.length)))
        tmp = 0
    now_level.value = tmp
})

function gotoGame(lid: number) {
    cover.value.style.visibility = "visible"
    cover.value.style.opacity = "1"
    setTimeout(() => { router.push(`/game/${lid}`) }, 500)
}
function gotoHelp() {
    cover.value.style.visibility = "visible"
    cover.value.style.opacity = "1"
    setTimeout(() => { router.push(`/help`) }, 500)
}
function gotoDesigner() {
    cover.value.style.visibility = "visible"
    cover.value.style.opacity = "1"
    setTimeout(() => { router.push(`/game/design`) }, 500)
}

const levelDataString = ref("")
function importLevel() {
    localStorage.levelData = levelDataString.value
    cover.value.style.visibility = "visible"
    cover.value.style.opacity = "1"
    setTimeout(() => { router.push(`/game/custom`) }, 500)
}
</script>

<template>
    <div class="cover" ref="cover"></div>
    <div class="gs" ref="fog">
        <div class="pg-container">
            <h1 class="pg-header">关卡选择</h1>
            <ul class="pg-nav">
                <li class="pg-nav-item"><a href="javascript:;" class="pg-nav-link" @click="gotoHelp">玩法帮助</a></li>
                <li class="pg-nav-item"><a href="javascript:;" class="pg-nav-link" @click="gotoDesigner">关卡设计器</a></li>
            </ul>
            <div class="pg-divider"></div>
            <div class="pg-level-list">
                <div class="pg-level-box" v-for="(l, i) in level_list" v-bind:key="i"
                    :style="`background-image: url(${baseURL}${l.img});`" @click="gotoGame(i)">
                    <div class="pg-level-text">
                        <div class="pg-level-text-content">
                            Level {{ i }}
                            <div class="pg-level-name">{{ l.name }}</div>
                        </div>
                    </div>
                </div>
                <div class="pg-level-box" :style="`background-image: url(${baseURL}/imgs/designer.jpg);`" data-bs-toggle="modal"
                    data-bs-target="#importModal">
                    <div class="pg-level-text">
                        <div class="pg-level-text-content">
                            <div class="pg-level-name">
                                自定义关卡</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="modal fade" id="importModal" tabindex="-1" aria-labelledby="importModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="importModalLabel">自定义关卡</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    关卡代码<br>
                    <textarea class="form-control" style="width: 100%; height: 100%; min-height: 200px"
                        v-model="levelDataString"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal"
                        @click="importLevel">确定</button>
                    <button type="button" id="closeModelButton" class="btn btn-secondary"
                        data-bs-dismiss="modal">取消</button>
                </div>
            </div>
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

.lm {
    width: 80%;
    max-width: 480px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    cursor: pointer;
}

.lt {
    display: block;
    font-size: 48px;
    padding-top: 20px;
}

.lts {
    display: block;
    font-size: 24px;
    padding-top: 8px;
}
</style>