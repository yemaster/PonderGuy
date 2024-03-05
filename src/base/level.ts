// Three.js & Core components
import { Color, type Group, type OrthographicCamera, type PerspectiveCamera, type Scene, type WebGLRenderer, Vector3, Mesh, BoxGeometry, MeshBasicMaterial, SphereGeometry, AnimationClip, AnimationMixer, AnimationAction } from "three"
import calcRoute from "@/base/calcRoute"
import { unitWidth, type objectInfo } from "./constants";
import Plane from "@/components/plane"
import Cube from "@/components/cube"
import Rotator from "@/components/rotator"
import DrawBox from "@/components/drawbox"
import Mirror from "@/components/mirror"
import { DragControls, GLTFLoader } from "three/examples/jsm/Addons.js"

// Axios
import axios from 'axios'

class Level {
    scene: Scene;
    camera: OrthographicCamera | PerspectiveCamera;
    renderer: WebGLRenderer;
    movableObjects: Group[];
    startPos: Vector3 | undefined = undefined;
    destPos: Vector3[] = [];
    nowStage: number = 0;
    ponder: Group | null = null;
    tingyun: Mesh | null = null;
    animateProgress: number = -1;
    walkHint: Mesh | null = null;
    walkStage: number = -1;
    route: Vector3[] = [];
    uniteDragControl: DragControls | undefined;
    allCubes: any[] = [];
    mirror: Mirror | undefined;
    level: number;
    animation!: { mixer: AnimationMixer, animations: { "Running": AnimationAction, "Standing": AnimationAction } };
    constructor(level: number, scene: Scene, camera: OrthographicCamera | PerspectiveCamera, renderer: WebGLRenderer) {
        this.level = level
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.movableObjects = []

        this.setupScene()
    }
    check(): Vector3[] | null {
        if (this.startPos === undefined || this.destPos.length <= this.nowStage)
            return null
        const pos1 = this.nowStage > 0 ? this.destPos[this.nowStage - 1] : this.startPos,
            pos2 = this.destPos[this.nowStage]
        return calcRoute({
            objs: this.allCubes,
            mirror: this.mirror ? {
                pos: this.mirror.pos,
                len: this.mirror.len,
                objs: this.mirror.inMirrorObjs
            } : undefined
        }, pos1, pos2)
    }
    setupScene(): void {
        axios.get(`/levels/level${this.level}.json`).then(res => {
            const levelInfo = res.data
            this.scene.background = new Color(levelInfo.background || "#feffbd")

            this.startPos = new Vector3().fromArray(levelInfo.start)
            this.destPos = []
            levelInfo.dests.forEach((v: number[]) => {
                this.destPos.push(new Vector3().fromArray(v))
            })
            this.setupPonder(this.startPos)

            const dragObjs: any[] = []

            levelInfo.objects.forEach((v: objectInfo) => {
                let tmpDrawbox: DrawBox
                let obj: any
                switch (v.type) {
                    case "Cube":
                        obj = new Cube(v.pos, v.color)
                        this.scene.add(obj)
                        this.allCubes.push(obj)
                        break
                    case "Plane":
                        this.scene.add(new Plane(v.pos, v.color).obj)
                        break
                    case "Drawbox":
                        tmpDrawbox = new DrawBox(v.pos, v.size, v.range, v.color)
                        this.scene.add(tmpDrawbox)
                        this.allCubes.push(tmpDrawbox)
                        dragObjs.push(tmpDrawbox)
                        break
                    case "Rotator":
                        obj = new Rotator(v.pos, v.size, v.color, v.angle, v.direction, v.face)
                        this.scene.add(obj)
                        this.allCubes.push(obj)
                        break
                }
            })
            if (levelInfo.mirror) {
                this.mirror = new Mirror(levelInfo.mirror.pos, levelInfo.mirror.size, levelInfo.mirror.range)
                this.mirror.setupMirrorCubes(this.allCubes, this.scene)
                this.scene.add(this.mirror)
                dragObjs.push(...this.mirror.children)
            }

            // Setup up united drag control
            this.uniteDragControl = new DragControls(dragObjs, this.camera, this.renderer.domElement)
            this.uniteDragControl.addEventListener("dragstart", (e) => {
                const target = e.object.parent as any
                if (target.onControlDragStart)
                    target.onControlDragStart(e)
            })
            this.uniteDragControl.addEventListener("drag", (e) => {
                const target = e.object.parent as any
                if (target.onControlDrag)
                    target.onControlDrag(e)
            })
            this.uniteDragControl.addEventListener("dragend", (e) => {
                const target = e.object.parent as any
                if (target.onControlDragEnd)
                    target.onControlDragEnd(e)
            })
        }).catch((e) => {
            console.log("Cannot import level file!", e)
        })
    }
    setupPonder(pos: Vector3) {
        const loader = new GLTFLoader()
        loader.load("/ponder.glb", (gltf) => {
            //console.log(gltf)
            this.ponder = gltf.scene
            //console.log(gltf.animations)
            this.ponder.scale.set(14.5, 14.5, 14.5)
            this.ponder.position.set(
                pos.x * unitWidth + unitWidth / 2 + 100,
                (pos.y + 1) * unitWidth + 100,
                pos.z * unitWidth + unitWidth / 2 + 100
            )
            this.scene.add(this.ponder)

            const mixer = new AnimationMixer(this.ponder)
            this.animation = {
                mixer,
                animations: {
                    Running: mixer.clipAction(AnimationClip.findByName(gltf.animations, "Running")),
                    Standing: mixer.clipAction(AnimationClip.findByName(gltf.animations, "Standing")),
                }
            }
            this.animation.animations.Running.play()
            this.animation.animations.Running.weight = 0
            this.animation.animations.Standing.play()
            this.animation.animations.Standing.weight = 1
            //console.log(this.scene)
        })
        const ponderGeometry = new BoxGeometry(6, 12, 6)
        const tingyunMaterial = new MeshBasicMaterial({ color: 0xdb2828 })
        this.tingyun = new Mesh(ponderGeometry, tingyunMaterial)
        this.tingyun.position.set(
            this.destPos[0].x * unitWidth + unitWidth / 2,
            (this.destPos[0].y + 1) * unitWidth + 6,
            this.destPos[0].z * unitWidth + unitWidth / 2
        )
        this.scene.add(this.tingyun)
        const routeShowGeometry = new SphereGeometry(2)
        const routeShowMaterial = new MeshBasicMaterial({ color: 0xffffff })
        this.walkHint = new Mesh(routeShowGeometry, routeShowMaterial)
        this.walkHint.position.set(
            pos.x * unitWidth + unitWidth / 2,
            (pos.y + 1) * unitWidth + 6,
            pos.z * unitWidth + unitWidth / 2
        )
        this.scene.add(this.walkHint)
        this.walkHint.visible = false
    }
    updateAnimation(t: number) {
        if (this.animation)
            this.animation.mixer.update(t)
    }
    fixPos(p: Vector3) {
        return new Vector3(
            p.x * unitWidth + unitWidth / 2,
            (p.y + 1) * unitWidth,
            p.z * unitWidth + unitWidth / 2
        )
    }
    updatePonder() {
        if (!this.ponder || this.animateProgress <= 0)
            return
        if (this.animateProgress < this.route.length - 1) {
            this.animation.animations.Running.weight = 1
            this.animation.animations.Standing.weight = 0
            const targetPoint = this.route[this.animateProgress]
            const direction = new Vector3().subVectors(targetPoint, this.route[this.animateProgress - 1])
            if (direction.z > 0)
                this.ponder.rotation.set(0, 0, 0)
            else if (direction.z < 0)
                this.ponder.rotation.set(0, Math.PI, 0)
            else if (direction.x > 0)
                this.ponder.rotation.set(0, Math.PI / 2, 0)
            else if (direction.x < 0)
                this.ponder.rotation.set(0, -Math.PI / 2, 0)
            this.ponder.position.add(direction.clone().normalize().multiplyScalar(0.8))
            const realTarget = this.fixPos(targetPoint)
            const dist = Math.sqrt(Math.pow((this.ponder.position.x - this.ponder.position.y - realTarget.x + realTarget.y), 2) + Math.pow((this.ponder.position.z - this.ponder.position.y - realTarget.z + realTarget.y), 2))
            if (dist < 0.8)
                this.animateProgress++
        }
        else {
            this.animateProgress = -5
            this.animation.animations.Running.weight = 0
            this.animation.animations.Standing.weight = 1
        }
    }
    walkRoute(route: Vector3[]) {
        if (this.ponder === null)
            return
        if (this.walkStage === this.nowStage)
            return
        if (route.length <= 1)
            return
        this.route = route.concat([this.destPos[this.nowStage]])
        this.walkStage += 1
        this.animateProgress = 1
        this.disableControls()
    }
    enableControls() {
        if (this.uniteDragControl)
            this.uniteDragControl.enabled = true
    }
    disableControls() {
        if (this.uniteDragControl)
            this.uniteDragControl.enabled = false
    }
    nextStage(): Boolean {
        if (this.tingyun === null)
            return true
        if (this.nowStage + 1 < this.destPos.length)
            this.nowStage += 1
        else
            return false
        this.tingyun.position.set(
            this.destPos[this.nowStage].x * unitWidth + unitWidth / 2,
            (this.destPos[this.nowStage].y + 1) * unitWidth + 6,
            this.destPos[this.nowStage].z * unitWidth + unitWidth / 2
        )
        return true
    }

}

export default Level