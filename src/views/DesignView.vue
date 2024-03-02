<script setup lang="ts">
import { onMounted, ref, type Ref } from "vue"
import { type levelData, type objectInfo } from "@/base/constants"

// bootstrap
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap/dist/js/bootstrap.min.js"

// three.js
import { AxesHelper, Color, OrthographicCamera, Scene, WebGLRenderer, AmbientLight, DirectionalLight } from "three"
import Designer from "@/base/designer"

import debounce from 'lodash.debounce'

document.title = "关卡设计器 | Ponder Guy"

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

// Setup lights
const ambientLight = new AmbientLight(0xffffff)
scene.add(ambientLight)

const directionalLight = new DirectionalLight(0xffffff, 0.8)
directionalLight.position.set(0, 100, 0)
scene.add(directionalLight)

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

function changeStartPos() {
    designer.changePonderPos(levelInfo.value.start)
}

function addDestPos() {
    levelInfo.value.dests.push([0, 0, 1])
    designer.addNewTingyun([0, 0, 1])
}
function deleteDestPos(p: number) {
    levelInfo.value.dests.splice(p, 1)
    designer.deleteTingyun(p)
}
function updateDestPos(p: number) {
    designer.changeTingyunPos(p, levelInfo.value.dests[p])
}

const objNameTrans = ref({
    "Cube": "立方体",
    "Drawbox": "移动条",
    "Rotator": "旋转体",
    "Plane": "平面"
})

function addObject(type: string) {
    let objInfo!: objectInfo
    switch (type) {
        case "Cube":
            objInfo = { type, pos: [0, 0, 0], color: "#54c8ff" }
            break
        case "Drawbox":
            objInfo = { type, pos: [0, 0, 0], size: [1, 1, 4], range: [[0, 0], [0, 0], [0, 0]], color: "#ffe21f" }
            break
        case "Rotator":
            objInfo = { type, pos: [0, 0, 0], size: 4, angle: 0, color: "#fb8888" }
    }
    levelInfo.value.objects.push(objInfo)
    designer.addNewObject(objInfo)
}
function changeObj(p: number) {
    console.log(levelInfo.value.objects[p])
    designer.changeObjectInfo(p, levelInfo.value.objects[p])
}
function deleteObject(p: number) {
    levelInfo.value.objects.splice(p, 1)
    designer.deleteObject(p)
}

const mirrorEnabled = ref(false)
function changeMirrorEnableState() {
    designer.disposeMirror()
    if (mirrorEnabled.value) {
        levelInfo.value.mirror = {
            pos: [0, 0, 0],
            size: [5, 10, 0],
            range: [[-20, 20], [0, 0], [0, 0]]
        }
        designer.setupMirror(levelInfo.value.mirror)
    }
    else {
        levelInfo.value.mirror = undefined
    }
}

function changeMirror() {
    if (mirrorEnabled.value && levelInfo.value.mirror) {
        designer.changeMirrorInfo(levelInfo.value.mirror)
    }
}

const levelDataString = ref("")
function exportLevel() {
    levelDataString.value = btoa(JSON.stringify(levelInfo.value))
}
</script>
<template>
    <div class="ponder-design">
        <div class="left-control">
            <ul class="control-group list-group list-group-flush">
                <li class="list-group-item sticky-top">
                    <h4>关卡设计器</h4>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="modal"
                            data-bs-target="#exportModal" @click="exportLevel"
                            style="--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;">导出</button>
                    </div>
                </li>
                <li class="list-group-item">
                    <label for="background" class="form-label">背景色</label>
                    <input class="form-control" name="background" v-model="levelInfo.background" @change="changeBackground">
                </li>
                <li class="list-group-item">
                    <label for="background" class="form-label">起点坐标</label>
                    <div class="input-group mb-3">
                        <input type="number" class="form-control" placeholder="x坐标" v-model="levelInfo.start[0]"
                            @change="changeStartPos">
                        <input type="number" class="form-control" placeholder="y坐标" v-model="levelInfo.start[1]"
                            @change="changeStartPos">
                        <input type="number" class="form-control" placeholder="z坐标" v-model="levelInfo.start[2]"
                            @change="changeStartPos">
                    </div>
                </li>
                <li class="list-group-item">
                    <label class="form-label">终点坐标</label><br>
                    <div class="input-group mb-3" v-for="(d, i) in levelInfo.dests" v-bind:key="i">
                        <input type="number" class="form-control" placeholder="x坐标" v-model="d[0]"
                            @change="updateDestPos(i)">
                        <input type="number" class="form-control" placeholder="y坐标" v-model="d[1]"
                            @change="updateDestPos(i)">
                        <input type="number" class="form-control" placeholder="z坐标" v-model="d[2]"
                            @change="updateDestPos(i)">
                        <button class="btn btn-outline-danger" type="button" @click="deleteDestPos(i)">-</button>
                    </div>
                    <button class="btn btn-sm btn-outline-primary" @click="addDestPos">+</button>
                </li>
                <li class="list-group-item">
                    <label for="background" class="form-label">物体列表</label><br>
                    <div class="accordion mb-3" id="objectList">
                        <div class="accordion-item" v-for="(o, i) in levelInfo.objects" v-bind:key="i">
                            <span class="accordion-header">
                                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                    :data-bs-target="`#flush-${i}`" aria-expanded="false" :aria-controls="`flush-${i}`">
                                    {{ objNameTrans[o.type] }}
                                </button>
                            </span>
                            <div :id="`flush-${i}`" class="accordion-collapse collapse" data-bs-parent="#objectList">
                                <div class="accordion-body">
                                    <div class="form-group mb-3">
                                        <label class="form-label">物体位置</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control" placeholder="x坐标" v-model="o.pos[0]"
                                                @change="changeObj(i)">
                                            <input type="number" class="form-control" placeholder="y坐标" v-model="o.pos[1]"
                                                @change="changeObj(i)">
                                            <input type="number" class="form-control" placeholder="z坐标" v-model="o.pos[2]"
                                                @change="changeObj(i)">
                                        </div>
                                    </div>
                                    <template v-if="o.type === 'Drawbox'">
                                        <div class="form-group mb-3">
                                            <label class="form-label">物体大小</label>
                                            <div class="input-group">
                                                <input type="number" min="1" class="form-control" placeholder="x长度"
                                                    v-model="o.size[0]" @change="changeObj(i)">
                                                <input type="number" min="1" class="form-control" placeholder="y长度"
                                                    v-model="o.size[1]" @change="changeObj(i)">
                                                <input type="number" min="1" class="form-control" placeholder="z长度"
                                                    v-model="o.size[2]" @change="changeObj(i)">
                                            </div>
                                        </div>
                                        <div class="form-group mb-3">
                                            <label class="form-label">移动范围</label>
                                            <div class="input-group">
                                                <span class="input-group-text">x</span>
                                                <input type="number" class="form-control" placeholder="最小值"
                                                    v-model="o.range[0][0]" @change="changeObj(i)">
                                                <input type="number" class="form-control" placeholder="最大值"
                                                    v-model="o.range[0][1]" @change="changeObj(i)">
                                            </div>
                                            <div class="input-group">
                                                <span class="input-group-text">y</span>
                                                <input type="number" class="form-control" placeholder="最小值"
                                                    v-model="o.range[1][0]" @change="changeObj(i)">
                                                <input type="number" class="form-control" placeholder="最大值"
                                                    v-model="o.range[1][1]" @change="changeObj(i)">
                                            </div>
                                            <div class="input-group">
                                                <span class="input-group-text">z</span>
                                                <input type="number" class="form-control" placeholder="最小值"
                                                    v-model="o.range[2][0]" @change="changeObj(i)">
                                                <input type="number" class="form-control" placeholder="最大值"
                                                    v-model="o.range[2][1]" @change="changeObj(i)">
                                            </div>
                                        </div>
                                    </template>
                                    <template v-if="o.type === 'Rotator'">
                                        <div class="form-group mb-3">
                                            <label class="form-label">物体大小</label>
                                            <div class="input-group">
                                                <input type="number" min="1" class="form-control" placeholder="x长度"
                                                    v-model="o.size" @change="changeObj(i)">
                                            </div>
                                        </div>
                                        <div class="form-group mb-3">
                                            <label class="form-label">初始角度</label>
                                            <input type="number" class="form-control" placeholder="最小值" v-model="o.angle"
                                                @change="changeObj(i)">
                                        </div>
                                    </template>
                                    <div class="form-group mb-3">
                                        <label class="form-label">物体颜色</label>
                                        <div class="input-group">
                                            <input type="text" class="form-control" placeholder="#hex颜色值" v-model="o.color"
                                                @change="changeObj(i)">
                                        </div>
                                    </div>
                                    <div class="form-group mb-3">
                                        <button class="btn btn-sm btn-outline-danger" @click="deleteObject(i)">删除物体</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <label for="background" class="form-label">新建物体</label><br>
                    <div class="btn-group" role="group" aria-label="Basic example">
                        <button class="btn btn-sm btn-outline-primary" @click="addObject('Cube')">立方体</button>
                        <button class="btn btn-sm btn-outline-warning" @click="addObject('Drawbox')">移动条</button>
                        <button class="btn btn-sm btn-outline-danger" @click="addObject('Rotator')">旋转体</button>
                    </div>
                </li>
                <li class="list-group-item">
                    <label for="background" class="form-label">镜子设定</label><br>
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" v-model="mirrorEnabled"
                            @change="changeMirrorEnableState" id="mirrorEnabled">
                        <label class="form-check-label" for="mirrorEnabled">
                            开启镜子
                        </label>
                    </div>
                    <template v-if="mirrorEnabled && levelInfo.mirror">
                        <div class="form-group mb-3">
                            <label class="form-label">镜子位置</label>
                            <div class="input-group">
                                <input type="number" class="form-control" placeholder="x坐标"
                                    v-model="levelInfo.mirror.pos[0]" @change="changeMirror">
                                <input type="number" class="form-control" placeholder="y坐标"
                                    v-model="levelInfo.mirror.pos[1]" @change="changeMirror">
                                <input type="number" class="form-control" placeholder="z坐标"
                                    v-model="levelInfo.mirror.pos[2]" @change="changeMirror">
                            </div>
                        </div>
                        <div class="form-group mb-3">
                            <label class="form-label">镜子大小</label>
                            <div class="input-group">
                                <input type="number" min="0" class="form-control" placeholder="x长度"
                                    v-model="levelInfo.mirror.size[0]" @change="changeMirror">
                                <input type="number" min="1" class="form-control" placeholder="y长度"
                                    v-model="levelInfo.mirror.size[1]" @change="changeMirror">
                                <input type="number" min="0" class="form-control" placeholder="z长度"
                                    v-model="levelInfo.mirror.size[2]" @change="changeMirror">
                            </div>
                        </div>
                        <div class="form-group mb-3">
                            <label class="form-label">移动范围</label>
                            <div class="input-group">
                                <span class="input-group-text">x</span>
                                <input type="number" class="form-control" placeholder="最小值"
                                    v-model="levelInfo.mirror.range[0][0]" @change="changeMirror">
                                <input type="number" class="form-control" placeholder="最大值"
                                    v-model="levelInfo.mirror.range[0][1]" @change="changeMirror">
                            </div>
                            <div class="input-group">
                                <span class="input-group-text">y</span>
                                <input type="number" class="form-control" placeholder="最小值"
                                    v-model="levelInfo.mirror.range[1][0]" @change="changeMirror">
                                <input type="number" class="form-control" placeholder="最大值"
                                    v-model="levelInfo.mirror.range[1][1]" @change="changeMirror">
                            </div>
                            <div class="input-group">
                                <span class="input-group-text">z</span>
                                <input type="number" class="form-control" placeholder="最小值"
                                    v-model="levelInfo.mirror.range[2][0]" @change="changeMirror">
                                <input type="number" class="form-control" placeholder="最大值"
                                    v-model="levelInfo.mirror.range[2][1]" @change="changeMirror">
                            </div>
                        </div>
                    </template>
                </li>
            </ul>
        </div>
        <div class="right-scene">
            <canvas id="pg-canvas"></canvas>
        </div>
    </div>
    <div class="modal fade" id="exportModal" tabindex="-1" aria-labelledby="exportModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="exportModalLabel">导出代码</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    关卡代码<br>
                    <textarea class="form-control" style="width: 100%; height: 100%; min-height: 200px" v-model="levelDataString"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal">确定</button>
                </div>
            </div>
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

.accordion-button {
    padding: 8px 12px !important;
}

@media screen and (max-width: 768px) {
    .ponder-design {
        display: flex;
        flex-direction: column;
    }

    .left-control {
        width: 100%;
        height: 50%;
        order: 2;
    }

    .right-scene {
        width: 100%;
        height: 50%;
        order: 1;
    }
}
</style>
