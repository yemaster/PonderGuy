<script setup lang="ts">
import { onMounted, ref, type Ref } from "vue"
import { type levelData } from "@/base/constants"

// bootstrap
import "bootstrap/dist/css/bootstrap.min.css"

// three.js
import { AxesHelper, Color, OrthographicCamera, Scene, WebGLRenderer } from "three"
import Designer from "@/base/designer"

import debounce from 'lodash.debounce'

const levelInfo: Ref<levelData> = ref({
    background: "#feffbd",
    start: [0, 0, 0],
    dests: [[0, 0, 1]],
    objects: []
})

const sizes = {
    width: Math.floor(window.innerWidth * 0.7),
    height: window.innerHeight
}

let canvas: HTMLCanvasElement
const getCanvasRelativePosition = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect()
    return {
        x: (e.clientX - rect.left) * canvas.width / rect.width,
        y: (e.clientY - rect.top) * canvas.height / rect.height,
    }
}

const scene = new Scene()
scene.background = new Color(levelInfo.value.background)
const camera = new OrthographicCamera(
    sizes.width / -16,
    sizes.width / 16,
    sizes.height / 16,
    sizes.height / -16,
    -200,
    500
)

camera.position.set(200, 200, 200)
camera.lookAt(scene.position)

let renderer!: WebGLRenderer

let designer!: Designer

const axesHelper = new AxesHelper(100)
scene.add(axesHelper)

const canvasResizeHandler = () => {
    const rects = canvas.getBoundingClientRect()

    sizes.height = rects.height
    sizes.width = rects.width

    camera.left = sizes.width / -2
    camera.right = sizes.width / 2
    camera.top = sizes.height / 2
    camera.bottom = sizes.height / -2

    camera.left *= 0.5
    camera.right *= 0.5
    camera.top *= 0.5
    camera.bottom *= 0.5

    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(window.devicePixelRatio)
}

const setupScene = () => {
    canvas = document.getElementById("pg-canvas") as HTMLCanvasElement
    renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
    })
    renderer.localClippingEnabled = true

    designer = new Designer(scene, camera, renderer, levelInfo.value.start)
    designer.addNewTingyun([0, 0, 1])

    canvasResizeHandler()

    // Animate three.js scene
    const animate = () => {
        requestAnimationFrame(animate)
        renderer.render(scene, camera)
    }
    animate()
}

onMounted(setupScene)
window.addEventListener("resize", debounce(canvasResizeHandler, 100))

function changeBackground() {
    scene.background = new Color(levelInfo.value.background)
}

function parsePos(p: string): [number, number, number] {
    const tmpPos: string[] = p.split(",")
    const pos: [number, number, number] = [0, 0, 0]
    if (tmpPos.length !== 3)
        return [0, 0, 0]
    for (let i = 0; i < 3; ++i)
        pos[i] = Math.floor(Number(tmpPos[i])) || 0
    return pos
}

const tempStartPos = ref("0,0,0")
function changeStartPos() {
    levelInfo.value.start = parsePos(tempStartPos.value)
    designer.changePonderPos(levelInfo.value.start)
}

const tempDestPos = ref(["0,0,1"])
function addDestPos() {
    levelInfo.value.dests.push([0, 0, 1])
    tempDestPos.value.push("0,0,1")
    designer.addNewTingyun([0, 0, 1])
}
function deleteDestPos(p: number) {
    levelInfo.value.dests.splice(p, 1)
    tempDestPos.value.splice(p, 1)
    designer.deleteTingyun(p)
}
function updateDestPos(p: number) {
    levelInfo.value.dests[p] = parsePos(tempDestPos.value[p])
    designer.changeTingyunPos(p, levelInfo.value.dests[p])
}
</script>
<template>
    <div class="ponder-design">
        <div class="left-control">
            <ul class="control-group list-group list-group-flush">
                <li class="list-group-item">
                    <label for="background" class="form-label">背景色</label>
                    <input class="form-control" name="background" v-model="levelInfo.background" @change="changeBackground">
                </li>
                <li class="list-group-item">
                    <label for="background" class="form-label">起点坐标</label>
                    <input class="form-control" name="background" v-model="tempStartPos" @change="changeStartPos">
                </li>
                <li class="list-group-item">
                    <label class="form-label">终点坐标</label><br>
                    <div class="input-group mb-3" v-for="(d, i) in tempDestPos" v-bind:key="i">
                        <input type="text" class="form-control" v-model="tempDestPos[i]" @change="updateDestPos(i)">
                        <button class="btn btn-outline-danger" type="button" @click="deleteDestPos(i)">-</button>
                    </div>
                    <button class="btn btn-sm btn-outline-primary" @click="addDestPos">+</button>
                </li>
                <li class="list-group-item">
                    <label for="background" class="form-label">物体列表</label><br>
                    <div class="input-group mb-3">

                    </div>
                </li>
                <li class="list-group-item">
                    <label for="background" class="form-label">镜子设定</label><br>
                </li>
            </ul>
        </div>
        <div class="right-scene">
            <canvas id="pg-canvas"></canvas>
        </div>
    </div>
</template>

<style scoped>
.ponder-design {
    display: flex;
    width: 100vw;
    height: 100vh;

    overflow: hidden;
}

.left-control {
    width: 30%;
    height: 100%;
    box-sizing: border-box;
    overflow: auto;
}

.control-group {
    width: 100%;
}

.right-scene {
    width: 70%;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
}

#pg-canvas {
    width: 100% !important;
    height: 100% !important;
}
</style>
