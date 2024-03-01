import { Color, type Group, type OrthographicCamera, type PerspectiveCamera, type Scene, type WebGLRenderer, Vector3, Mesh, BoxGeometry, MeshBasicMaterial, SphereGeometry } from "three"
import calcRoute from "@/base/calcRoute"
import { unitWidth } from "./constants";
import Plane from "@/components/plane"
import Cube from "@/components/cube"
import Rotator from "@/components/rotator"
import DrawBox from "@/components/drawbox"
import Mirror from "@/components/mirror"
import { DragControls, OrbitControls } from "three/examples/jsm/Addons.js"

class Level {
    scene: Scene;
    camera: OrthographicCamera | PerspectiveCamera;
    renderer: WebGLRenderer;
    movableObjects: Group[];
    startPos: Vector3 | undefined = undefined;
    destPos: Vector3[] = [];
    nowStage: number = 0;
    ponder: Mesh | null = null;
    tingyun: Mesh | null = null;
    animateProgress: number = -1;
    walkHint: Mesh | null = null;
    walkStage: number = -1;
    route: Vector3[] = [];
    controlList: DragControls[] = [];
    allCubes: any[] = [];
    level: number;
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
        return calcRoute(this.scene, pos1, pos2)
    }
    setupScene(): void {
        import(`@/levels/level${this.level}.json`).then(levelInfo => {
            this.scene.background = new Color(levelInfo.background || "#feffbd")

            this.startPos = new Vector3().fromArray(levelInfo.start)
            this.destPos = []
            levelInfo.dests.forEach((v: number[]) => {
                this.destPos.push(new Vector3().fromArray(v))
            })
            this.setupPonder(this.startPos)

            levelInfo.objects.forEach((v: any) => {
                let tmpDrawbox: DrawBox, tmpDragControl: DragControls
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
                        tmpDrawbox = new DrawBox(v.pos, v.size, v.color)
                        this.scene.add(tmpDrawbox)
                        this.allCubes.push(tmpDrawbox)
                        tmpDragControl = new DragControls(tmpDrawbox.children, this.camera, this.renderer.domElement)
                        tmpDrawbox.setupController(tmpDragControl, v.range || [[1], [1], [1]])
                        break
                    case "Rotator":
                        obj = new Rotator(v.pos, v.size, v.color, v.angle)
                        this.scene.add(obj)
                        this.allCubes.push(obj)
                        break
                }
            })
            if (levelInfo.mirror) {
                const mirror = new Mirror(levelInfo.mirror.pos, levelInfo.mirror.size)
                mirror.setupMirrorCubes(this.allCubes, this.scene)
                const mirrorDrag = new DragControls(mirror.children, this.camera, this.renderer.domElement)
                mirror.setupController(mirrorDrag, levelInfo.mirror.range || [[1], [1], [1]])
                this.scene.add(mirror)
            }
        }).catch((E) => {
            console.log("Cannot import level file!")
        })
    }
    setupPonder(pos: Vector3) {
        const ponderGeometry = new BoxGeometry(6, 12, 6)
        const ponderMaterial = new MeshBasicMaterial({ color: 0x47af50 })
        const tingyunMaterial = new MeshBasicMaterial({ color: 0xdb2828 })
        this.ponder = new Mesh(ponderGeometry, ponderMaterial)
        this.ponder.position.set(
            pos.x * unitWidth + unitWidth / 2,
            (pos.y + 1) * unitWidth + 6,
            pos.z * unitWidth + unitWidth / 2
        )
        this.tingyun = new Mesh(ponderGeometry, tingyunMaterial)
        this.scene.add(this.ponder)
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
    updatePonder(progress: number) {
        if (this.ponder === null || this.walkHint === null)
            return
        if (progress > 50 && progress < 100)
            return
        const ave = (progress >= 50 ? 100 : 50) / (this.route.length - 1)
        let progressTmp = progress
        this.walkHint.visible = true
        if (progress >= 50) {
            this.walkHint.visible = false
            progressTmp -= 100
        }
        const prog = Math.floor(progressTmp / ave)
        const rate = (progressTmp - prog * ave) / ave
        let pos: Vector3
        if (progress === 50 || progress === 200)
            pos = this.route[this.route.length - 1]
        else {
            const startVec = this.route[prog]
            const direction = new Vector3().subVectors(this.route[prog + 1], this.route[prog]).multiplyScalar(rate)
            pos = startVec.add(direction)
        }
        if (progress <= 50)
            this.walkHint.position.set(
                pos.x * unitWidth + unitWidth / 2,
                (pos.y + 1) * unitWidth + 6,
                pos.z * unitWidth + unitWidth / 2
            )
        else if (progress >= 100)
            this.ponder.position.set(
                pos.x * unitWidth + unitWidth / 2,
                (pos.y + 1) * unitWidth + 6,
                pos.z * unitWidth + unitWidth / 2
            )

    }
    walkRoute(route: Vector3[]) {
        if (this.ponder === null)
            return
        if (this.walkStage === this.nowStage)
            return
        this.route = route
        this.walkStage += 1
        this.animateProgress = 0
        this.disableControls()
    }
    enableControls() {
        for (let i = 0; i < this.controlList.length; ++i)
            this.controlList[i].enabled = true
    }
    disableControls() {
        for (let i = 0; i < this.controlList.length; ++i)
            this.controlList[i].enabled = false
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