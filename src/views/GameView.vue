<script setup lang="ts">
// Vue core modules
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Three.js core modules
import { Scene, OrthographicCamera, AmbientLight, DirectionalLight, Vector2, Clock } from 'three'
import { WebGLRenderer } from 'three'
import Picker from '@/base/picker'

// Level
import Level from '@/base/level'

import debounce from 'lodash.debounce'
import { OrbitControls } from 'three/examples/jsm/Addons.js'

// Icons
import iconMenu from '@/components/icons/iconMenu.vue'

// Get level id
let nowLevel: Level
const isCustom = ref(false)
if (route.params.id === "custom")
    isCustom.value = true
const levelId = ref(Number(route.params.id) || 0)
document.title = `关卡#${levelId.value} | Ponder Guy`
const fog = ref()
const levelShow = ref()

// Prepare APIs for custom level
const levelClickEvent = () => {
    nowLevel.handleEvent("click")
}

const hint = ref("")
const hintVisible = ref(false)

function showHint(val: string) {
    let delayTime = 0
    if (hintVisible.value) {
        hintVisible.value = false
        delayTime = 300
    }
    setTimeout(() => {
        hintVisible.value = true
        hint.value = val
    }, delayTime)
}

function hideHint() {
    hintVisible.value = false
}

// Setup Three.js Scene
// Get window sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

let canvas: HTMLCanvasElement
// Define scene, camera and renderer
const scene = new Scene()
const camera = new OrthographicCamera(
    sizes.width / -16,
    sizes.width / 16,
    sizes.height / 16,
    sizes.height / -16,
    -500,
    2000
)
let renderer!: WebGLRenderer
camera.position.set(250, 250, 250)
camera.lookAt(scene.position)
camera.zoom = 2
scene.add(camera)

// Setup lights
const ambientLight = new AmbientLight(0xffffff)
scene.add(ambientLight)

const directionalLight = new DirectionalLight(0xffffff, 0.8)
directionalLight.position.set(0, 100, 0)
scene.add(directionalLight)

// Handle Click Event
const pickPosition = { x: 0, y: 0 }
const originPosition = { x: 0, y: 0 }
const picker = new Picker()
let isObjectChosen = false
let chosenObject: any = null
let isPress = false

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
    if (isPress) {
        if (!isObjectChosen) {
            /*const deltaX = e.clientX - originPosition.x
            const deltaY = e.clientY - originPosition.y
            camera.position.x -= deltaX
            camera.position.y += deltaY
            camera.position.z += deltaX*/
        }
        else {
            if (chosenObject && nowLevel.animateProgress === -1) {
                if (chosenObject.onDrag)
                    chosenObject.onDrag(picker.raycaster, picker.pickedObjectPoint)
            }
        }
        originPosition.x = e.clientX
        originPosition.y = e.clientY
    }
    else if (picker.pickedObject) {
        //
    }
}
const clearPickPosition = () => {
    pickPosition.x = -100000
    pickPosition.y = -100000
    originPosition.x = -100000
    originPosition.y = -100000
    isObjectChosen = false
}
clearPickPosition()
window.addEventListener('mousemove', setPickPosition)
window.addEventListener('mouseout', clearPickPosition)
window.addEventListener('mouseleave', clearPickPosition)
/*window.addEventListener('touchstart', (e: TouchEvent) => {
    e.preventDefault()
    setPickPosition(e.touches[0])
}, { passive: false })
window.addEventListener('touchmove', (e: TouchEvent) => {
    setPickPosition(e.touches[0])
})*/
window.addEventListener('touchend', clearPickPosition)

// Hanlde canvas resize event
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

// Setup Scene
const clock = new Clock()

// Mouse Event
const handleMouseDown = (e: MouseEvent) => {
    isObjectChosen = !(picker.pickedObject === undefined)
    isPress = true
    originPosition.x = e.clientX
    originPosition.y = e.clientY

    if (picker.pickedObject && nowLevel.animateProgress === -1) {
        const p = picker.pickedObject.parent
        if (p && p.type === 'Group' && p.movable) {
            if (p.objectType === "Rotator") {
                nowLevel.handleEvent("rotate")
                nowLevel.rotateEventTime++
            }
            chosenObject = p
            if (p.onDragStart)
                p.onDragStart(picker.raycaster, picker.pickedObjectPoint)
        }
    }
}
const handleMouseUp = () => {
    isPress = false
    if (chosenObject && nowLevel.animateProgress === -1) {
        if (chosenObject.onDragEnd) {
            chosenObject.onDragEnd(picker.raycaster, picker.pickedObjectPoint)
            const route = nowLevel.check()
            if (route !== null)
                nowLevel.walkRoute(route)
        }
    }
}
const setupScene = () => {
    canvas = document.getElementById("pg-canvas") as HTMLCanvasElement
    renderer = new WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
    })
    renderer.localClippingEnabled = true

    nowLevel = new Level(isCustom.value ? localStorage.levelData : levelId.value, scene, camera, renderer, (e: any) => { alert(e); router.push("/game/list") }, {
        showHint, hideHint
    })
    //window.level = nowLevel
    picker.updateObjs(scene.children)

    const oc = new OrbitControls(camera, renderer.domElement)
    oc.enableRotate = false
    oc.zoomToCursor = true

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mouseup", handleMouseUp)

    canvasResizeHandler()

    // Prepare Events for Level Designer
    window.addEventListener("click", levelClickEvent)

    const showNextLevel = () => {
        setTimeout(() => {
            fog.value.style.visibility = "visible"
            fog.value.style.opacity = "1"
        }, 200)
        setTimeout(() => {
            levelShow.value.style.opacity = "1"
        }, 500)
        setTimeout(() => {
            levelShow.value.style.transition = "all .2s"
            levelShow.value.style.opacity = "0"
        }, 1300)
        setTimeout(() => {
            levelShow.value.innerText = "Finish!"
            levelShow.value.style.opacity = "1"
        }, 1500)
        setTimeout(() => {
            fog.value.style.opacity = "0"
        }, 3200)
        setTimeout(() => {
            router.replace(`/game/list`)
        }, 4200)
    }

    // Animate three.js scene
    const animate = () => {
        requestAnimationFrame(animate)
        if (nowLevel.animateProgress === -5) {
            nowLevel.animateProgress = -1
            nowLevel.enableControls()
            if (!nowLevel.nextStage()) {
                showNextLevel()
            }
            else {
                const route = nowLevel.check()
                if (route !== null)
                    nowLevel.walkRoute(route)
            }
        }
        if (nowLevel.animateProgress !== -1) {
            nowLevel.updatePonder()
        }
        nowLevel.updateAnimation(clock.getDelta())
        picker.pick(new Vector2(pickPosition.x, pickPosition.y), scene, camera)
        renderer.render(scene, camera)
    }
    animate()

    setTimeout(() => {
        levelShow.value.style.top = "50%"
        levelShow.value.style.opacity = "1"
    }, 200)

    setTimeout(() => {
        fog.value.style.opacity = "0"
        levelShow.value.style.opacity = "0"
        fog.value.style.visibility = "hidden"
        nowLevel.handleEvent("init")
    }, 2200)
}
//const axesHelper = new AxesHelper(100)
//scene.add(axesHelper)

onMounted(setupScene)
window.addEventListener("resize", debounce(canvasResizeHandler, 100))

function backLevel() {
    fog.value.style.opacity = "1"
    fog.value.style.visibility = "visible"
    setTimeout(() => {
        router.replace(`/game/list`)
    }, 1000)
}

onBeforeUnmount(() => {
    // Destroy scene
    window.removeEventListener('mousemove', setPickPosition)
    window.removeEventListener('mouseout', clearPickPosition)
    window.removeEventListener('mouseleave', clearPickPosition)
    window.removeEventListener("resize", debounce(canvasResizeHandler, 100))
    window.removeEventListener("click", levelClickEvent)
    canvas.removeEventListener("mousedown", handleMouseDown)
    canvas.removeEventListener("mouseup", handleMouseUp)

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
    <div class="fog" ref="fog">
        <div class="level-show" ref="levelShow">
            <template v-if="isCustom">自定义关卡</template>

            <template v-else>Level {{ levelId }}</template>
        </div>
    </div>
    <div class="pg-game-container">
        <canvas id="pg-canvas"></canvas>
    </div>
    <div class="pg-back-button" @click="backLevel()">
        <icon-menu></icon-menu>
    </div>
    <div class="pg-hint" :class="{ show: hintVisible }">{{ hint }}</div>
</template>

<style scoped>
.fog {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(255, 255, 255, .8);
    backdrop-filter: blur(5px);
    z-index: 5;
    transition: all .8s;
}

.level-show {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-sizing: border-box;

    font-family: "genshin";
    font-size: 48px;
    padding: 32px 64px;
    border: 10px solid #000;

    opacity: 0;
    z-index: 6;
    transition: all .8s;
}

.pg-game-container {
    width: 100vw;
    height: 100vh;
}

#pg-canvas {
    width: 100% !important;
    height: 100% !important;
}

.pg-back-button {
    position: absolute;
    top: 20px;
    left: 20px;

    cursor: pointer;
}

.pg-hint {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, .4);
    backdrop-filter: blur(10px);

    padding: 50px 10%;
    text-align: center;
    box-sizing: border-box;

    color: #fff;
    font-family: "genshin";
    font-size: 20px;

    opacity: 0;

    transition: opacity .1s;
}

.pg-hint.show {
    opacity: 1;
}
</style>