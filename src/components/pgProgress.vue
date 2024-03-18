<script setup lang="ts">
import { computed, toRefs } from 'vue'

const props = defineProps({
    progress: {
        type: Number,
        default: 0
    }
})

const { progress } = toRefs(props)

const fixedProgress = computed(() => {
    if (progress.value < 0)
        return 0
    else if (progress.value > 100)
        return 100
    else return progress.value.toFixed(2)
})
</script>

<template>
    <div class="pg-progress-container">
        <div class="pg-progress">
            <div class="pg-progress-bar" :style="`width: ${fixedProgress}%`"></div>
        </div>
        <div class="pg-progress-text">
            <slot>{{ fixedProgress }}%</slot>
        </div>
    </div>
</template>

<style>
.pg-progress-container {
    display: flex;

    width: 100%;
}

.pg-progress {
    position: relative;
    box-sizing: border-box;
    width: calc(100% - 100px);
    height: 22px;
    border: 1px solid #eee;
}

@keyframes progressAnimation {
    from {
        background: #0060bb;
    }

    to {
        background: #47b0ff;
    }
}

.pg-progress-bar {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 0%;
    background-color: #1780db;
    box-shadow: 0 5px 10px rgba(23, 128, 219, .2);
    transition: width .2s;
    animation: progressAnimation 3s linear 0s infinite alternate;
}

.pg-progress-text {
    text-align: center;
    width: 100px;
    font-size: 14px;
    line-height: 22px;
    box-sizing: border-box;
    padding: 0 3px;
}
</style>