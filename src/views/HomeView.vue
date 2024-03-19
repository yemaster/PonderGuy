<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, toRaw, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'

import { AmbientLight, Color, DirectionalLight, Mesh, MeshLambertMaterial, PerspectiveCamera, PlaneGeometry, Scene, Vector3, WebGLRenderer } from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

import pgModal from '@/components/pgModal.vue';
import pgProgress from '@/components/pgProgress.vue'

import { useStore } from '@/store'

const store = useStore()

import debounce from 'lodash.debounce'
import pgButton from '@/components/pgButton.vue';
import { formatSize } from '@/base/methods';

const pg = getCurrentInstance()

const cl = ref()
const fog = ref()
const pageHeader = ref()
const startButton = ref()
const startText = ref()
const cover = ref()
const router = useRouter()

document.title = "Ponder Guy"

let loadTimes = 0
const updateModalShow = ref(false)
const isUpdating = ref(false)

const latest = ref("unknown")
const nowVersion = ref("unknown")
const updateLog = ref("暂无更新日志")

const downloadSpeed = ref(0)
const downloadSize = ref(0)
const allSize = ref(0)

const updateProgress = ref(0)

const nextStage = (time: number = 500) => {
    setTimeout(() => {
        startText.value.style.opacity = "0"
        startText.value.style.visibility = "hidden"
        startButton.value.style.opacity = "1"
        startButton.value.style.visibility = "visible"
        updateModalShow.value = false
    }, time)
}

const startUpdate = () => {
    isUpdating.value = true
    updateProgress.value = 0
    const update = pg?.appContext.config.globalProperties?.$injectFunc?.update
    if (update) {
        update((val: number, speed: number, all: number, now: number) => {
            updateProgress.value = val
            downloadSpeed.value = speed
            allSize.value = all
            downloadSize.value = now
        }, () => {
            textinfo.value = "更新成功!"
            setTimeout(() => {
                textinfo.value = "正在重启程序..."
            }, 1000)
            setTimeout(() => {
                const restart = pg?.appContext.config.globalProperties?.$injectFunc?.restartAPP
                if (restart) {
                    restart()
                }
                else {
                    textinfo.value = "重启失败，请手动重启！"
                    setTimeout(() => { nextStage() }, 1000)
                }
            }, 2000)
        }, () => {
            textinfo.value = "更新失败!"
            nextStage()
        })
    } else {
        textinfo.value = "更新失败!"
        nextStage()
    }
}

function tryToShow() {
    loadTimes++
    if (loadTimes > 1) {
        pageHeader.value.classList.remove("first")
        fog.value.style.opacity = "0"
        cover.value.style.opacity = "0"
        cover.value.style.visibility = "hidden"
        startText.value.style.opacity = "1"
        setTimeout(() => {
            fog.value.style.visibility = "hidden"
        }, 500)
        setTimeout(() => {
            pageHeader.value.style.zIndex = "0"
            //startButton.value.style.opacity = "1"
        }, 800)

        // Check for updates
        setTimeout(() => {
            textinfo.value = "检查更新中..."
            const checkUpdate = pg?.appContext.config.globalProperties?.$injectFunc?.checkUpdate
            if (checkUpdate) {
                checkUpdate((needUpdate: boolean, nowV: string, lat: string, log: string) => {
                    nowVersion.value = nowV
                    latest.value = lat
                    updateLog.value = log
                    if (!needUpdate)
                        nextStage()
                    else {
                        updateModalShow.value = true
                        textinfo.value = ""
                    }
                }, (e: any) => {
                    textinfo.value = "更新检查失败"
                    console.log(e)
                    nextStage()
                })
            } else {
                textinfo.value = "更新检查失败"
                console.log("NO", (window as any)?.injectFunctions)
                nextStage()
            }
        }, 1000)
    }
}

const textinfo = ref("")

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
let canvas: HTMLCanvasElement
const scene = new Scene()
scene.background = new Color(0xfeffbd)
const camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 50)
camera.position.set(-5, 5, 20)
camera.lookAt(new Vector3(15, 15, 0))

const plane = new Mesh(new PlaneGeometry(100, 100), new MeshLambertMaterial({ color: 0xeeeeee }))
plane.rotation.x = -Math.PI / 2
scene.add(plane)

// Setup lights
const ambientLight = new AmbientLight(0xffffff, 2)
scene.add(ambientLight)

const directionalLight = new DirectionalLight(0xffffff, 0.9)
directionalLight.position.set(0, 40, 0)
scene.add(directionalLight)

let renderer!: WebGLRenderer

function render() {
    renderer.render(scene, camera);
    store.updateAnimation()
    requestAnimationFrame(render);
}

const canvasResizeHandler = () => {
    const rects = canvas.getBoundingClientRect()

    sizes.height = rects.height
    sizes.width = rects.width

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(window.devicePixelRatio)
}

const setupScene = () => {
    canvas = document.querySelector('#home-scene') as HTMLCanvasElement
    renderer = new WebGLRenderer({ antialias: true, canvas })

    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)

    store.getPonderModel().then((data) => {
        //console.log(data)
        //const modelUrl = URL.createObjectURL(new Blob([data]))
        //console.log(modelUrl)
        const gltf = toRaw(data)
        const ponder = gltf.scene
        ponder.scale.set(15, 15, 15)
        scene.add(ponder)

        store.setAnimation("Sitting")

        tryToShow()
    })
    canvasResizeHandler()
    requestAnimationFrame(render);
}

window.addEventListener("resize", debounce(canvasResizeHandler, 100))

onMounted(() => {
    cover.value.style.visibility = "visible"
    cover.value.style.opacity = "1"
    setupScene()
    setTimeout(() => {
        cl.value.style.opacity = "1"
    }, 100)
    setTimeout(() => {
        cl.value.style.opacity = "0"
    }, 2000)
    setTimeout(() => {
        pageHeader.value.style.opacity = "1"
    }, 3000)
    setTimeout(() => {
        tryToShow()
    }, 4000)
})

function gotoList() {
    cover.value.style.visibility = "visible"
    cover.value.style.opacity = "1"
    setTimeout(() => {
        router.push("/game/list")
    }, 500)
}

onBeforeUnmount(() => {
    window.removeEventListener("resize", debounce(canvasResizeHandler, 100))

    try {
        renderer.dispose();
        renderer.forceContextLoss();
        let gl = renderer.domElement.getContext("webgl");
        if (gl && gl.getExtension("WEBGL_lose_context")) {
            gl.getExtension("WEBGL_lose_context")?.loseContext();
        }
        scene.traverse((child: any) => {
            if (child.material) {
                child.material.dispose()
            }
            if (child.geometry) {
                child.geometry.dispose()
            }
            child = null
        })
    } catch (e) {
        console.error("Failed to destroy threejs", e);
    }
})
</script>

<template>
    <div class="cover" ref="cover"></div>
    <div class="fog" ref="fog">
        <div class="com-logo" ref="cl">
            <img src="@/assets/logo.svg">
            <span>VegeTable Game</span>
        </div>
    </div>
    <div class="progress-page">

    </div>
    <div>
        <div class="pg-header-logo first" ref="pageHeader">Ponder Guy</div>
        <div class="pg-start-button" ref="startButton" @click="gotoList">点 击 开 始</div>
        <div class="pg-start-text" ref="startText">
            <div class="spinner-border loader" v-if="textinfo.length > 0"></div>
            {{ textinfo }}
        </div>
    </div>
    <canvas id="home-scene"></canvas>
    <pg-modal title="" :backClick="false" backgroundColor="#f0f1f3" mode="round" v-model:show="updateModalShow">
        <template #content>
            <div style="display:flex">
                <div style="margin-right: 10px"><img src="/logo.png" width="64px" style="border-radius: 15px;"></div>
                <div>
                    <div style="font-size: 20px; font-weight: bold; margin: 10px 0 5px 0;">
                        <template v-if="isUpdating">更新中</template>
                        <tempalte v-else>有新版本啦！</tempalte>
                    </div>
                    <div style="font-size: 14px">当前版本：{{ nowVersion }} → 升级到：{{ latest }}</div>
                </div>
            </div>
            <div class="update-log">
                <div v-html="updateLog"></div>
            </div>
        </template>
        <template #append>
            <template v-if="isUpdating">
                <div style="width: 100%; margin-bottom: 5px; font-size: 14px">
                    {{ formatSize(downloadSize) }} / {{ formatSize(allSize) }} &nbsp; {{ formatSize(downloadSpeed) }}/s.
                </div>
                <pg-progress :progress="updateProgress">
                    <template v-if="textinfo.length > 0">
                        {{ textinfo }}
                    </template>
                    <template v-else>
                        {{ updateProgress.toFixed(2) }}%
                    </template>
                </pg-progress>
            </template>
            <template v-else>
                <pg-button color="#db2828" style="width: 100px" mode="round" size="tiny"
                    @click="nextStage(0)">取消(</pg-button>
                <pg-button color="#47af50" style="width: 100px" mode="round" size="tiny"
                    @click="startUpdate()">更新!</pg-button>
            </template>
        </template>
    </pg-modal>
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
    opacity: 1;
    z-index: 21;

    transition: opacity .5s;
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

#home-scene {
    width: 100vw !important;
    height: 100vh !important;
}

.update-log {
    display: block;

    width: 100%;
    height: 50vh;
    overflow: auto;
    background-color: #fff;
    padding: 8px 12px;
    border-radius: 5px;
    font-size: 14px;
    line-height: 1.5rem;

    margin-top: 12px;
    margin-bottom: -24px;
}
</style>

<style>
.pg-modal-text {
    border-color: transparent !important;
}
</style>