<script setup lang="ts">
import { onMounted, ref, type Ref } from "vue"
import { RouterLink } from 'vue-router'
import { unitWidth, type levelData, type objectInfo } from "@/base/constants"

// three.js
import { AxesHelper, Color, OrthographicCamera, Scene, WebGLRenderer, AmbientLight, DirectionalLight, Vector2 } from "three"
import Designer from "@/base/designer"

import debounce from 'lodash.debounce'
import Picker from "@/base/picker"
import { OrbitControls, TransformControls } from "three/examples/jsm/Addons.js"
import { fixPos } from "@/base/methods"

import pgModal from "@/components/pgModal.vue"
import pgButton from "@/components/pgButton.vue"

document.title = "关卡设计器 | Ponder Guy"

const leftControl = ref()

const levelInfo: Ref<levelData> = ref({
    background: "#feffbd",
    start: [0, 0, 0],
    dests: [[0, 0, 5]],
    objects: []
})

// Click Events
const pickPosition = { x: 0, y: 0 }
const picker = new Picker()

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
const setPickPosition = (e: MouseEvent) => {
    const pos = getCanvasRelativePosition(e)
    pickPosition.x = (pos.x / canvas.width) * 2 - 1
    pickPosition.y = (pos.y / canvas.height) * -2 + 1
}
const clearPickPosition = () => {
    pickPosition.x = -100000
    pickPosition.y = -100000
}
clearPickPosition()
window.addEventListener('mousemove', setPickPosition)
window.addEventListener('mouseout', clearPickPosition)
window.addEventListener('mouseleave', clearPickPosition)

window.addEventListener('touchend', clearPickPosition)

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
camera.zoom = 2

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

let tc!: TransformControls

const setupScene = () => {
    canvas = document.getElementById("pg-canvas") as HTMLCanvasElement
    renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
    })
    renderer.localClippingEnabled = true

    designer = new Designer(scene, camera, renderer, levelInfo.value.start)
    designer.addNewTingyun([0, 0, 5])
    designer.dragControl.enabled = false

    const oc = new OrbitControls(camera, renderer.domElement)
    oc.enableRotate = false

    tc = new TransformControls(camera, renderer.domElement)
    tc.setSize(0.3)
    window.addEventListener("mousedown", (e) => {
        if (e.button === 2) {
            tc.detach()
        }
    })
    tc.addEventListener("objectChange", (e) => {
        let t = e.target.object as any
        if (!t)
            return
        while (!t.parent.isScene) {
            t = t.parent
        }
        const p = designer.objects.indexOf(t)
        if (p === -1)
            return
        switch (t.objectType) {
            case "Cube":
                levelInfo.value.objects[p].pos = [fixPos(t.children[0].position.x, 1), fixPos(t.children[0].position.y, 1), fixPos(t.children[0].position.z, 1)]
                changeObj(p)
                break
            case "Drawbox":
                levelInfo.value.objects[p].pos = [fixPos(t.children[0].position.x, t.len[0]), fixPos(t.children[0].position.y, t.len[1]), fixPos(t.children[0].position.z, t.len[2])]
                changeObj(p)
                break
            case "Mirror":
                if (levelInfo.value.mirror) {
                    levelInfo.value.mirror.pos = [fixPos(t.children[0].position.x, t.len[0]), fixPos(t.children[0].position.y, t.len[1]), fixPos(t.children[0].position.z, t.len[2])]
                    designer.changeMirrorInfo(levelInfo.value.mirror)
                }
                break
            case "Rotator":
                levelInfo.value.objects[p].pos = [Math.round(t.position.x / unitWidth - 1 / 2), Math.round(t.position.y / unitWidth), Math.round(t.position.z / unitWidth - 1 / 2)]
                changeObj(p)
                break
        }
        designer.mirror?.updateMirrorCubePos()
    })
    scene.add(tc)

    canvas.addEventListener("mousedown", () => {
        if (picker.pickedObject) {
            let p = picker.pickedObject
            while (!p.parent.isScene) {
                p = p.parent
            }
            const pos = designer.objects.indexOf(p)
            if (pos !== -1) {
                const btn = document.querySelector(`#flush-button-${pos}`) as HTMLButtonElement
                if (btn) {
                    if (btn.classList.contains("collapsed"))
                        btn.click()
                    setTimeout(() => {
                        const tmr = setInterval(() => {
                            const d = btn.getBoundingClientRect().top
                            if (Math.abs(d - 80) <= 30 || (leftControl.value.scrollTop + leftControl.value.offsetHeight + 10 > leftControl.value.scrollHeight)) {
                                leftControl.value.scrollTop += d - 80
                                clearInterval(tmr)
                            }
                            else {
                                if (d > 80)
                                    leftControl.value.scrollTop += 10
                                else
                                    leftControl.value.scrollTop -= 10
                            }

                        }, 10)
                    }, 300)
                }
            }
            if (["Cube", "Drawbox", "Rotator"].includes(p.objectType)) {
                if (p.objectType === "Rotator")
                    tc.attach(p)
                else
                    tc.attach(p.children[0])
                tc.setMode("translate")
                //tc.setTranslationSnap(unitWidth)
            }
            else {
                tc.detach()
            }
        }
    })

    canvasResizeHandler()

    // Animate three.js scene
    const animate = () => {
        requestAnimationFrame(animate)
        picker.pick(new Vector2(pickPosition.x, pickPosition.y), scene, camera)
        renderer.render(scene, camera)
    }
    animate()
}

onMounted(setupScene)
window.addEventListener("resize", debounce(canvasResizeHandler, 100))

const freeControl = ref(true)
function changeFreeControl() {
    if (freeControl.value) {
        tc.enabled = true
        designer.dragControl.enabled = false
        scene.add(tc)
    }
    else {
        tc.enabled = false
        designer.dragControl.enabled = true
        scene.remove(tc)
    }
}

function changeBackground() {
    scene.background = new Color(levelInfo.value.background)
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

let lastPos: [number, number, number] = [0, 0, 0]
function addObject(type: string) {
    let objInfo!: objectInfo
    lastPos[1]++
    switch (type) {
        case "Cube":
            objInfo = { type, pos: Array.from(lastPos) as [number, number, number], color: "#54c8ff" }
            break
        case "Drawbox":
            objInfo = { type, pos: Array.from(lastPos) as [number, number, number], size: [1, 1, 4], range: [[0, 0], [0, 0], [0, 0]], color: "#ffe21f" }
            break
        case "Rotator":
            objInfo = { type, pos: Array.from(lastPos) as [number, number, number], size: [4, 4], face: ["+x", "+z"], direction: 1, angle: 0, color: "#fb8888" }
    }
    levelInfo.value.objects.push(objInfo)
    designer.addNewObject(objInfo)
    picker.updateObjs(designer.objects)
}
function changeObj(p: number) {
    //console.log(levelInfo.value.objects[p])
    designer.changeObjectInfo(p, levelInfo.value.objects[p])
    lastPos = [...levelInfo.value.objects[p].pos]
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
        picker.updateObjs([...designer.objects, designer.mirror])
    }
    else {
        levelInfo.value.mirror = undefined
        picker.updateObjs(designer.objects)
    }
}

function changeMirror() {
    if (mirrorEnabled.value && levelInfo.value.mirror) {
        designer.changeMirrorInfo(levelInfo.value.mirror)
    }
}

const levelDataString = ref("")
const levelDataSetMode = ref("导出")
const errorInfo = ref("")

const modalShow = ref(false)
function importLevelBefore() {
    levelDataSetMode.value = "导入"
    levelDataString.value = ""
    errorInfo.value = ""
    modalShow.value = true
}
function exportLevel() {
    levelDataSetMode.value = "导出"
    levelDataString.value = btoa(JSON.stringify(levelInfo.value))
    errorInfo.value = ""
    modalShow.value = true
}
function importLevel() {
    try {
        const levelRawData = JSON.parse(atob(levelDataString.value)) as levelData
        while (levelInfo.value.dests.length > 0)
            deleteDestPos(0)
        while (levelInfo.value.objects.length > 0)
            deleteObject(0)
        mirrorEnabled.value = false
        picker.updateObjs([])

        levelInfo.value.start = levelRawData.start
        changeStartPos()

        for (let i = 0; i < levelRawData.dests.length; ++i) {
            addDestPos()
            levelInfo.value.dests[i] = levelRawData.dests[i]
            updateDestPos(i)
        }

        for (let i = 0; i < levelRawData.objects.length; ++i) {
            addObject(levelRawData.objects[i].type)
            levelInfo.value.objects[i] = levelRawData.objects[i]
            changeObj(i)
        }

        if (levelRawData.mirror) {
            mirrorEnabled.value = true
            changeMirrorEnableState()
            levelInfo.value.mirror = levelRawData.mirror
            changeMirror()
        }

        document.getElementById("closeModelButton")?.click()
    }
    catch (e) {
        errorInfo.value = `导入失败!\n${e}`
    }
}
</script>

<template>
    <div class="ponder-design">
        <div class="left-control" ref="leftControl">
            <ul class="control-group list-group list-group-flush">
                <li class="list-group-item sticky-top">
                    <h4>关卡设计器</h4>
                    <div class="btn-group">
                        <router-link class="btn btn-sm btn-outline-secondary" to="/game/list"
                            style="--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;">返回</router-link>
                        <button class="btn btn-sm btn-outline-secondary" @click="importLevelBefore"
                            style="--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;">导入</button>
                        <button class="btn btn-sm btn-outline-secondary" @click="exportLevel"
                            style="--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;">导出</button>
                    </div>
                </li>
                <li class="list-group-item">
                    <label for="background" class="form-label">基础设定</label><br>
                    <div class="form-check mb-4">
                        <input class="form-check-input" type="checkbox" v-model="freeControl"
                            @change="changeFreeControl" id="freeControlEnabled">
                        <label class="form-check-label" for="freeControlEnabled">
                            自由控制
                        </label>
                    </div>
                    <div class="form-group">
                        <label for="background" class="form-label">背景色</label>
                        <input class="form-control" name="background" v-model="levelInfo.background"
                            @change="changeBackground">
                    </div>
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
                                <button class="accordion-button collapsed" :id="`flush-button-${i}`" type="button"
                                    data-bs-toggle="collapse" :data-bs-target="`#flush-${i}`" aria-expanded="false"
                                    :aria-controls="`flush-${i}`">
                                    {{ objNameTrans[o.type] }}
                                </button>
                            </span>
                            <div :id="`flush-${i}`" class="accordion-collapse collapse" data-bs-parent="#objectList">
                                <div class="accordion-body">
                                    <div class="form-group mb-3">
                                        <label class="form-label">物体位置</label>
                                        <div class="input-group">
                                            <input type="number" class="form-control" placeholder="x坐标"
                                                v-model="o.pos[0]" @change="changeObj(i)">
                                            <input type="number" class="form-control" placeholder="y坐标"
                                                v-model="o.pos[1]" @change="changeObj(i)">
                                            <input type="number" class="form-control" placeholder="z坐标"
                                                v-model="o.pos[2]" @change="changeObj(i)">
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
                                                <input type="number" min="1" class="form-control" placeholder="长度1"
                                                    v-model="o.size[0]" @change="changeObj(i)">
                                                <input type="number" min="1" class="form-control" placeholder="长度2"
                                                    v-model="o.size[1]" @change="changeObj(i)">
                                            </div>
                                        </div>
                                        <div class="form-group mb-3">
                                            <label class="form-label">摆放方向</label>
                                            <div class="input-group">
                                                <select class="form-control" v-model="o.face[0]" @change="changeObj(i)">
                                                    <option value="+x">+x</option>
                                                    <option value="+y">+y</option>
                                                    <option value="+z">+z</option>
                                                    <option value="-x">-x</option>
                                                    <option value="-y">-y</option>
                                                    <option value="-z">-z</option>
                                                </select>
                                                <select class="form-control" v-model="o.face[1]" @change="changeObj(i)">
                                                    <option value="+x">+x</option>
                                                    <option value="+y">+y</option>
                                                    <option value="+z">+z</option>
                                                    <option value="-x">-x</option>
                                                    <option value="-y">-y</option>
                                                    <option value="-z">-z</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="form-group mb-3">
                                            <label class="form-label">旋转面</label>
                                            <select class="form-control" v-model="o.direction" @change="changeObj(i)">
                                                <option :value="0">yOz平面</option>
                                                <option :value="1">xOz平面</option>
                                                <option :value="2">xOy平面</option>
                                            </select>
                                        </div>
                                        <div class="form-group mb-3">
                                            <label class="form-label">初始方向</label>
                                            <input type="number" min="0" max="3" class="form-control" placeholder="最小值"
                                                v-model="o.angle" @change="changeObj(i)">
                                        </div>
                                    </template>
                                    <div class="form-group mb-3">
                                        <label class="form-label">物体颜色</label>
                                        <div class="input-group">
                                            <input type="text" class="form-control" placeholder="#hex颜色值"
                                                v-model="o.color" @change="changeObj(i)">
                                        </div>
                                    </div>
                                    <div class="form-group mb-3">
                                        <button class="btn btn-sm btn-outline-danger"
                                            @click="deleteObject(i)">删除物体</button>
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
    <pg-modal :title="`${levelDataSetMode}代码`" :backClick="false" backgroundColor="#f0f1f3" mode="round"
        v-model:show="modalShow">
        <template #content>
            <div class="update-log">
                <label>关卡代码</label>
                <textarea class="pg-textarea" style="width: 100%; height: 100%; min-height: 200px"
                    v-model="levelDataString"></textarea><br>
                <span style="color: #db2828">{{ errorInfo }}</span>
            </div>
        </template>
        <template #append>
            <template v-if="levelDataSetMode === '导入'">
                <pg-button color="#db2828" style="width: 100px" mode="round" size="tiny"
                    @click="modalShow = false">取消</pg-button>
                <pg-button style="width: 100px" mode="round" size="tiny" @click="importLevel">导入</pg-button>
            </template>
            <template v-else>
                <pg-button style="width: 100px" mode="round" size="tiny" @click="modalShow = false">关闭</pg-button>
            </template>
        </template>
    </pg-modal>
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
