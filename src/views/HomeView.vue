<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const cl = ref()
const router = useRouter()

onMounted(() => {
    setTimeout(() => {
        cl.value.style.opacity = "1"
    }, 100)
    setTimeout(() => {
        cl.value.style.opacity = "0"
        router.push("/game/list")
    }, 2000)
})
</script>

<template>
    <div class="com-logo" ref="cl">
        <img src="@/assets/logo.svg">
        <span>VegeTable Game</span>
    </div>
</template>

<style>
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