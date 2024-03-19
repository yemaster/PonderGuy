<script setup lang="ts">
// Vue Core
import { onMounted, ref, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Axios
import axios from '@/base/axios'
document.title = `关卡选择 | Ponder Guy`

import pgModal from '@/components/pgModal.vue';
import pgButton from '@/components/pgButton.vue';

const importModalShow = ref(false)

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
function gotoLink(link: string) {
    cover.value.style.visibility = "visible"
    cover.value.style.opacity = "1"
    setTimeout(() => { router.push(link) }, 500)
}

const levelDataString = ref("")
function importLevel() {
    importModalShow.value = false
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
            <div class="pg-flex" style="width: 100%; justify-content: space-between;">
                <h1 class="pg-header">关卡选择</h1>
                <div style="align-self: flex-end;">
                    <ul class="pg-nav">
                        <li class="pg-nav-item"><a href="javascript:;" class="pg-nav-link"
                                @click="gotoLink('/help')">玩法帮助</a></li>
                        <li class="pg-nav-item"><a href="javascript:;" class="pg-nav-link"
                                @click="gotoLink('/game/design')">关卡设计器</a></li>
                        <!--li class="pg-nav-item"><a href="javascript:;" class="pg-nav-link"
                                @click="gotoLink('/settings')">设置</a></li-->
                    </ul>
                </div>
            </div>
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
                <div class="pg-level-box" :style="`background-image: url(${baseURL}/imgs/designer.jpg);`"
                   @click="importModalShow = true">
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
    <pg-modal title="自定义代码" :backClick="false" backgroundColor="#f0f1f3" mode="round" v-model:show="importModalShow">
        <template #content>
            <div class="update-log">
                <label>关卡代码</label>
                <textarea class="pg-textarea" style="width: 100%; height: 100%; min-height: 200px"
                    v-model="levelDataString"></textarea>
            </div>
        </template>
        <template #append>
            <pg-button color="#db2828" style="width: 100px" mode="round" size="tiny"
                @click="importModalShow = false">取消</pg-button>
            <pg-button style="width: 100px" mode="round" size="tiny" @click="importLevel">导入</pg-button>
        </template>
    </pg-modal>
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