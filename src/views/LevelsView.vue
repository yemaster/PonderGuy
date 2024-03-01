<script setup lang="ts">
// Vue Core
import { ref, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Axios
import axios from 'axios'

const route = useRoute()
const router = useRouter()

const level_list: Ref<string[]> = ref([])
const now_level = ref(0)
axios.get("/levels/list.json").then(res => {
    const level_data = res.data
    level_list.value = level_data.levels

    let tmp = Number(route.query.level)
    if (!((tmp >= 0 && tmp < level_list.value.length)))
        tmp = 0
    now_level.value = tmp
})

const lc = ref()

function gotoGame() {
    lc.value.style.opacity = "0"
    setTimeout(() => { router.push(`/game/${now_level.value}`) }, 1000)
}
</script>

<template>
    <div class="lc" ref="lc">
        <div class="lm" @click="gotoGame">
            <img src="@/assets/level.png" width="60%">
            <span class="lt">{{ level_list[now_level] }}</span>
            <span class="lts">Level {{ now_level }}</span>
        </div>
    </div>
</template>

<style scoped>
.lc {
    font-family: "genshin";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fffebd;

    transition: all .5s;
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