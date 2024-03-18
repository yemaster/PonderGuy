<script setup lang="ts">
import { toRefs, computed } from 'vue'
const props = defineProps({
    color: {
        type: String,
        default: "#1780db"
    },
    mode: {
        type: String,
        default: "round"
    },
    size: {
        type: String,
        default: "medium"
    }
})

const { color, size, mode } = toRefs(props)

const textColor = computed(() => {
    const r = parseInt(color.value.substring(1, 3), 16)
    const g = parseInt(color.value.substring(3, 5), 16)
    const b = parseInt(color.value.substring(5, 7), 16)
    if (r * 0.299 + g * 0.587 + b * 0.114 >= 192)
        return "#212223"
    else
        return "#fcfbfe"
})
</script>

<template>
    <button class="pg-button" :class="`${size} ${mode}`" :style="{ backgroundColor: color, color: textColor }">
        <slot>wee</slot>
    </button>
</template>

<style>
.pg-button {
    border: none;
    outline: none;
    box-shadow: none;
    transform: none;

    padding: 8px 16px;

    transition: all .2s;
}
.pg-button.round {
    border-radius: 5px;
}
.pg-button.huge {
    font-size: 1.15rem;
}
.pg-button.big {
    font-size: 1.1rem;
}
.pg-button.small {
    font-size: 0.9rem;
    padding: 6px 12px;
}
.pg-button.tiny {
    font-size: 0.85rem;
    padding: 4px 8px;
}

.pg-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, .2);
}
</style>