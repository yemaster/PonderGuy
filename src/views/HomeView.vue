<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { AmbientLight, AnimationClip, AnimationMixer, Clock, Color, DirectionalLight, Mesh, MeshLambertMaterial, PerspectiveCamera, PlaneGeometry, Scene, Vector3, WebGLRenderer } from 'three'
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

import debounce from 'lodash.debounce'

const cl = ref()
const fog = ref()
const pageHeader = ref()
const startButton = ref()
const cover = ref()
const router = useRouter()

document.title = "Ponder Guy"

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

const clock = new Clock()
let mixer: AnimationMixer

function render() {
    renderer.render(scene, camera);
    if (mixer)
        mixer.update(clock.getDelta())
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
    loader.load("/ponder.glb", gltf => {
        const ponder = gltf.scene
        ponder.scale.set(15, 15, 15)
        scene.add(ponder)

        mixer = new AnimationMixer(ponder)
        const clip = mixer.clipAction(AnimationClip.findByName(gltf.animations, "Sitting"))
        clip.play()
    })
    canvasResizeHandler()
    requestAnimationFrame(render);
}

window.addEventListener("resize", debounce(canvasResizeHandler, 100))

onMounted(() => {
    setTimeout(() => {
        cl.value.style.opacity = "1"
    }, 100)
    setTimeout(() => {
        cl.value.style.opacity = "0"
        fog.value.style.opacity = "0"
        setupScene()
    }, 2000)
    setTimeout(() => {
        pageHeader.value.style.opacity = "1"
        pageHeader.value.style.transform = "translate(-70%, -50%)"
        fog.value.style.visibility = "hidden"
    }, 2500)
    setTimeout(() => {
        startButton.value.style.opacity = "1"
    }, 2800)
})

function gotoList() {
    cover.value.style.visibility = "visible"
    cover.value.style.opacity = "1"
    setTimeout(() => {
        router.push("/game/list")
    }, 500)
}

</script>

<template>
    <div class="cover" ref="cover"></div>
    <div class="fog" ref="fog">
        <div class="com-logo" ref="cl">
            <img src="@/assets/logo.svg">
            <span>VegeTable Game</span>
        </div>
    </div>
    <div>
        <div class="pg-header-logo" ref="pageHeader">Ponder Guy</div>
        <div class="pg-start-button" ref="startButton" @click="gotoList">点 击 开 始</div>
    </div>
    <canvas id="home-scene"></canvas>
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
    z-index: 1;

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
</style>