<script setup lang="ts">
import { toRefs, ref, watch } from 'vue'
import pgButton from './pgButton.vue'
const props = defineProps({
    title: String,
    show: Boolean,
    backgroundColor: {
        type: String,
        default: "#ffffff"
    },
    mode: {
        type: String,
        default: "round"
    },
    backClick: {
        type: Boolean,
        default: true
    },
    showAppend: {
        type: Boolean,
        default: true
    }
})

const updateShow = defineEmits(["update:show"])

const { title, show, backClick, mode, showAppend } = toRefs(props)
const realShowMode = ref(show.value)

function hideModal(force = false) {
    if (backClick.value || force)
        updateShow("update:show", !show.value)
}

watch(() => show.value, (n) => {
    setTimeout(() => {
        realShowMode.value = n
    }, 200)
})
</script>

<template>
    <div class="pg-modal" :class="{ show: realShowMode, hide: !realShowMode, 'show-append': showAppend }">
        <div class="pg-modal-back" @click="hideModal()"></div>
        <div class="pg-modal-container" :style="`background-color: ${backgroundColor}`"
            :class="{ show: show, hide: !show, round: mode === 'round' }">
            <div class="pg-modal-text">
                <div class="pg-modal-title" v-if="title">{{ title }}</div>
                <div class="pg-modal-content">
                    <slot name="content">Modal Info</slot>
                </div>
            </div>
            <div class="pg-modal-append">
                <slot name="append">
                    <pg-button size="small" @click="hideModal(true)">关闭</pg-button>
                </slot>
            </div>
        </div>
    </div>
</template>

<style>
.pg-modal.hide {
    display: none;
}

.pg-modal-back {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, .75);

    z-index: 1024;
}

.pg-modal-container {
    position: absolute;
    top: 10%;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 548px;
    z-index: 1025;

    box-shadow: 0 2px 4px rgba(0, 0, 0, .2);

    transition: all .2s;
}

.pg-modal-container.round {
    border-radius: 10px;
}

@media screen and (max-height: 376px) {
    .pg-modal-container {
        top: 0;
        bottom: 0;
    }
}

.pg-modal-text {
    padding: 24px 24px;
}

.pg-modal.show-append .pg-modal-text {
    border-bottom: 1px solid #ccc;
}

.pg-modal-container.hide {
    top: 20%;
    opacity: 0;
}

.pg-modal-title {
    font-size: 1.4rem;
    margin-bottom: 12px;
}

.pg-modal-content {
    line-height: 1.5rem;
}

.pg-modal:not(.show-append) .pg-modal-append {
    display: none;
}

.pg-modal-append {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    margin-left: auto;
    padding: 12px 18px;
}

.pg-modal-append .pg-button {
    margin-left: 12px;
}
</style>