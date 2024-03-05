<script setup lang="ts">
import { ref } from 'vue'
import { RouterView, RouterLink } from 'vue-router'

const year = ref(new Date().getFullYear())
</script>

<template>
    <router-view />
    <div class="footer">
        CopyRight &copy; {{ year }} yemaster. <router-link to="/about">关于此项目</router-link> | <a href="https://github.com/yemaster/PonderGuy" target="_blank">GITHUB</a>
    </div>
</template>