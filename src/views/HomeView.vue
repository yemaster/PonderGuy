<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Scene } from 'three'

const cl = ref()
const router = useRouter()

document.title = "Ponder Guy"

const scene = new Scene()

onMounted(() => {
    setTimeout(() => {
        cl.value.style.opacity = "1"
    }, 100)
    setTimeout(() => {
        cl.value.style.opacity = "0"
    }, 2000)
})
</script>

<template>
    <div class="fog">
        <div class="com-logo" ref="cl">
            <img src="@/assets/logo.svg">
            <span>VegeTable Game</span>
        </div>
    </div>
</template>

<style scoped>
.fog {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, .8);
    backdrop-filter: blur(5px);
    z-index: 1;
}

.com-logo {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    width: 80vw;
    max-width: 768px;
    text-align: center;

    opacity: 0;

    transition: opacity .4s;
}

.com-logo img {
    width: 120px;
    vertical-align: middle;
}

.com-logo span {
    font-family: "myriadpro-semibold";
    font-size: 48px;
    vertical-align: middle;
}
</style>