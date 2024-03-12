// Three.js & Core components
import { Color, type Group, type OrthographicCamera, type PerspectiveCamera, type Scene, type WebGLRenderer, Vector3, Mesh, BoxGeometry, MeshBasicMaterial, SphereGeometry, AnimationClip, AnimationMixer, AnimationAction, Points, BufferGeometry, PointsMaterial, BufferAttribute, Box3 } from "three"
import calcRoute from "@/base/calcRoute"
import { unitWidth, type objectInfo, type levelData, type appendObjectsMethod } from "./constants";
import Plane from "@/components/plane"
import Cube from "@/components/cube"
import Rotator from "@/components/rotator"
import DrawBox from "@/components/drawbox"
import Mirror from "@/components/mirror"
import { DragControls, GLTFLoader } from "three/examples/jsm/Addons.js"
import { animate } from "popmotion"
import { useStore } from "@/store";

// Axios
import axios from 'axios'
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

class Level {
    scene: Scene;
    camera: OrthographicCamera | PerspectiveCamera;
    renderer: WebGLRenderer;

    allCubes: any[] = [];
    draggableObjects: any[] = [];
    uniteDragControl: DragControls | undefined;
    mirror: Mirror | undefined;

    ponder: Group | null = null;
    tingyun: Mesh | null = null;

    startPos: Vector3 | undefined = undefined;
    destPos: Vector3[] = [];
    walkHint: Mesh | null = null;
    nowStage: number = 0;
    animateProgress: number = -1;
    walkStage: number = -1;
    route: Vector3[] = [];

    level: number;
    levelData: string = "";

    animation!: { mixer: AnimationMixer, animations: { "Running": AnimationAction, "Standing": AnimationAction } };
    particleGeometry: BufferGeometry = new BufferGeometry();
    particlePositions: Float32Array = new Float32Array(20 * 3);
    particle: Points;

    injectMethods: any;
    appendActions: any = {};
    appendObjects: any = {};

    // Event Times
    dragEventTime: number = 0;
    mirrorEventTime: number = 0;
    rotateEventTime: number = 0;
    constructor(level: number | string, scene: Scene, camera: OrthographicCamera | PerspectiveCamera, renderer: WebGLRenderer, onError: Function = (e: any) => { console.log(e) }, met: any) {
        if (typeof level === 'string')
            this.level = -1
        else
            this.level = level
        this.scene = scene
        this.camera = camera
        this.renderer = renderer

        if (typeof level === "string") {
            try {
                this.setupScene(JSON.parse(atob(level)))
            }
            catch (e) {
                onError(e)
            }
        }
        else {
            axios.get(`/levels/level${this.level}.json`).then(res => {
                this.setupScene(res.data)
            }).catch(e => {
                onError(e)
            })
        }

        this.particleGeometry.setAttribute('position', new BufferAttribute(this.particlePositions, 3))
        this.particle = new Points(this.particleGeometry, new PointsMaterial({
            color: 0xfbfdc8,
            size: 10
        }))
        this.particle.visible = false

        this.injectMethods = met
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

    // Append Codes
    parseCode(p: string) {
        const paras = p.split(/\s+/)
        const variables = {
            "dragTimes": this.dragEventTime,
            "mirrorTimes": this.mirrorEventTime,
            "rotateTimes": this.rotateEventTime
        }
        let match: RegExpMatchArray | null
        if (paras.length <= 0)
            return
        switch (paras[0]) {
            case "hideHint":
                this.injectMethods.hideHint()
                break
            case "showHint":
                this.injectMethods.showHint(paras.slice(1).join(" "))
                break
            case "delay":
                setTimeout(() => {
                    this.parseCode(paras.slice(2).join(" "))
                }, Number(paras?.[1] || 0) || 0)
                break
            case "if":
                match = (paras?.[1] || "").match(/([a-zA-Z]+)([<>]=?|=)(\d+)/)
                if (match && match.length === 4) {
                    const variableName = match[1]
                    const operator = match[2]
                    const value = Number(match[3])
                    if (variableName in variables) {
                        const variableValue = variables[variableName as "dragTimes" | "mirrorTimes" | "rotateTimes"]
                        let res = false
                        switch (operator) {
                            case "<":
                                res = variableValue < value
                                break
                            case "<=":
                                res = variableValue <= value
                                break
                            case '>':
                                res = variableValue > value
                                break
                            case '>=':
                                res = variableValue >= value
                                break
                            case '=':
                                res = variableValue === value
                                break
                        }
                        if (res) {
                            this.parseCode(paras.slice(2).join(" "))
                        }
                    }
                }
                break
            case "log":
                console.log(paras)
                break
        }
    }
    // Add Object
    addObject(v: objectInfo) {
        let tmpDrawbox: DrawBox
        let obj: any
        switch (v.type) {
            case "Cube":
                obj = new Cube(v.pos, v.color)
                if (v.name)
                    obj.name = v.name
                this.scene.add(obj)
                this.allCubes.push(obj)
                break
            case "Plane":
                this.scene.add(new Plane(v.pos, v.color).obj)
                break
            case "Drawbox":
                tmpDrawbox = new DrawBox(v.pos, v.size, v.range, v.color)
                if (v.name)
                    tmpDrawbox.name = v.name
                this.scene.add(tmpDrawbox)
                this.allCubes.push(tmpDrawbox)
                this.draggableObjects.push(tmpDrawbox)
                break
            case "Rotator":
                obj = new Rotator(v.pos, v.size, v.color, v.angle, v.direction, v.face)
                if (v.name)
                    obj.name = v.name
                this.scene.add(obj)
                this.allCubes.push(obj)
                break
        }
    }
    // Append Codes
    parseAction(p: string) {
        const codeLines = p.split(/\n+/)
        for (const line of codeLines) {
            this.parseCode(line)
        }
    }
    parseObjectAction(p: appendObjectsMethod[]) {
        p.forEach(v => {
            switch (v.type) {
                case "add":
                    this.addObject(v.obj)
                    break
                case "change":
                    if (v.obj.name) {
                        const obj = this.scene.getObjectByName(v.obj.name) as Cube | DrawBox | Rotator | undefined
                        if (obj) {
                            if (v.obj.pos)
                                obj.setPosAnimate(v.obj.pos)
                            if (v.obj.size && typeof (obj as any).setSize === 'function')
                                (obj as any).setSize(v.obj.pos)
                            if (v.obj.face && typeof (obj as any).setFace === 'function')
                                (obj as any).setFace(v.obj.face)
                            if (v.obj.range && typeof (obj as any).setRange === 'function')
                                (obj as any).setRange(v.obj.range)
                            if (v.obj.angle && typeof (obj as any).setAngle === 'function')
                                (obj as any).setAngle(v.obj.angle)
                            if (v.obj.direction && typeof (obj as any).setDirection === 'function')
                                (obj as any).setDirection(v.obj.direction)
                            if (v.obj.color && typeof (obj as any).setColor === 'function')
                                (obj as any).setColor(v.obj.color)
                        }
                    }
                    break
                case "remove":
                    if (v.obj.name) {
                        const obj = this.scene.getObjectByName(v.obj.name)
                        if (obj) {
                            let pos: number
                            pos = this.allCubes.findIndex(q => q.name === v.obj.name)
                            if (pos !== -1)
                                this.allCubes.splice(pos, 1)
                            pos = this.draggableObjects.findIndex(q => q.name === v.obj.name)
                            if (pos !== -1)
                                this.draggableObjects.splice(pos, 1)
                            this.scene.remove(obj)
                        }
                    }
                    break
            }
        })
        //this.setupDragControls()
    }
    // Activated when a event is happened
    handleEvent(e: string) {
        if (e in this.appendActions) {
            this.parseAction(this.appendActions[e])
        }
    }
    // Activated when a part is finished
    handleChangeObjectEvent(e: string) {
        if (e in this.appendObjects) {
            this.parseObjectAction(this.appendObjects[e])
        }
    }
    // Setup Scene
    setupScene(levelInfo: levelData): void {
        if (levelInfo.appendActions) {
            this.appendActions = levelInfo.appendActions
        }
        if (levelInfo.appendObjects) {
            this.appendObjects = levelInfo.appendObjects
        }

        this.scene.background = new Color(levelInfo.background || "#feffbd")

        this.startPos = new Vector3().fromArray(levelInfo.start)
        this.destPos = []
        levelInfo.dests.forEach((v: number[]) => {
            this.destPos.push(new Vector3().fromArray(v))
        })
        this.setupPonder(this.startPos)

        levelInfo.objects.forEach((v: objectInfo) => {
            this.addObject(v)
        })
        if (levelInfo.mirror) {
            this.mirror = new Mirror(levelInfo.mirror.pos, levelInfo.mirror.size, levelInfo.mirror.range)
            this.mirror.setupMirrorCubes(this.allCubes, this.scene)
            this.scene.add(this.mirror)
            this.draggableObjects.push(this.mirror)
        }

        this.setupDragControls()

        this.scene.add(this.particle)
    }
    disposeDragControls() {
        if (this.uniteDragControl) {
            this.uniteDragControl.dispose()
        }
        this.uniteDragControl = undefined
    }
    setupDragControls() {
        // First Dispose controls
        this.disableControls()
        // Setup up united drag control
        this.uniteDragControl = new DragControls(this.draggableObjects, this.camera, this.renderer.domElement)
        this.uniteDragControl.addEventListener("dragstart", (e) => {
            let target = e.object as any
            while (!target.parent.isScene)
                target = target.parent
            if (target.onControlDragStart)
                target.onControlDragStart(e)
            if (target.objectType === "Mirror") {
                this.handleEvent("mirror")
                this.mirrorEventTime++
            }
            else {
                this.handleEvent("drag")
                this.dragEventTime++
            }
        })
        this.uniteDragControl.addEventListener("drag", (e) => {
            let target = e.object as any
            while (!target.parent.isScene)
                target = target.parent
            if (!this.detachCollide(target) && target.onControlDrag)
                target.onControlDrag(e)
            else {
                target.setPos(target.pos)
            }
        })
        this.uniteDragControl.addEventListener("dragend", (e) => {
            let target = e.object as any
            while (!target.parent.isScene)
                target = target.parent
            if (target.onControlDragEnd)
                target.onControlDragEnd(e)
        })
    }
    setupPonder(pos: Vector3) {
        const loader = new GLTFLoader()
        loader.setMeshoptDecoder(MeshoptDecoder)

        const store = useStore()
        store.getPonder().then((data) => {
            //console.log(data)
            //const modelUrl = URL.createObjectURL(new Blob([data]))
            //console.log(modelUrl)
            loader.parse(data, "/", gltf => {
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
            (pos.y + 1) * unitWidth,
            pos.z * unitWidth + unitWidth / 2
        )
        this.scene.add(this.walkHint)
        this.walkHint.visible = false

        //const particleGeometry = new BufferGeometry();
        //const particleMaterial = new PointsMaterial({
        //    color: 0xffff00,
        //    size: 0.1,
        //    opacity: 0.5,
        //})

        //this.particles = new Points(particleGeometry, particleMaterial);
        //this.scene.add(this.particles);
    }
    // Animations
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
        if (!this.ponder || !this.walkHint || this.animateProgress <= 0)
            return
        if (this.animateProgress >= this.route.length + this.route.length - 1) {
            this.animateProgress = -5
            this.animation.animations.Running.weight = 0
            this.animation.animations.Standing.weight = 1
        }
        else {
            if (this.animateProgress === this.route.length - 1) {
                this.animateProgress = this.route.length + 1
                this.walkHint.visible = false
                this.particle.visible = false
            }
            const targetPoint = this.route[this.animateProgress % this.route.length]
            const direction = new Vector3().subVectors(targetPoint, this.route[(this.animateProgress % this.route.length) - 1])
            const objectTarget = (this.animateProgress < this.route.length) ? this.walkHint : this.ponder
            const walkLength = (this.animateProgress < this.route.length) ? 3 : 0.8
            if (this.animateProgress < this.route.length - 1) {
                this.walkHint.visible = true
                this.particle.visible = true
                for (let i = 0; i < this.particlePositions.length; i += 3) {
                    this.particlePositions[i] = objectTarget.position.x + Math.random() * 2 - 1
                    this.particlePositions[i + 1] = objectTarget.position.y + Math.random() * 2 - 1
                    this.particlePositions[i + 2] = objectTarget.position.z + Math.random() * 2 - 1
                }
                this.particleGeometry.attributes.position.needsUpdate = true
            }
            else {
                this.animation.animations.Running.weight = 1
                this.animation.animations.Standing.weight = 0
                if (direction.z > 0)
                    this.ponder.rotation.set(0, 0, 0)
                else if (direction.z < 0)
                    this.ponder.rotation.set(0, Math.PI, 0)
                else if (direction.x > 0)
                    this.ponder.rotation.set(0, Math.PI / 2, 0)
                else if (direction.x < 0)
                    this.ponder.rotation.set(0, -Math.PI / 2, 0)

                //this.particlePositions.push(this.ponder.position.clone());
                //if (this.particlePositions.length > 100)
                //    this.particlePositions.shift()
                //this.particles.geometry.setFromPoints(this.particlePositions)
                //console.log(this.particles, this.particlePositions)
            }
            objectTarget.position.add(direction.clone().normalize().multiplyScalar(walkLength))
            const realTarget = this.fixPos(targetPoint)
            const dist = Math.sqrt(Math.pow((objectTarget.position.x - objectTarget.position.y - realTarget.x + realTarget.y), 2) + Math.pow((objectTarget.position.z - objectTarget.position.y - realTarget.z + realTarget.y), 2))
            if (dist < walkLength * 2)
                this.animateProgress++
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
        this.handleEvent(`finish_${this.nowStage}`)
    }
    // Control control
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
        this.handleChangeObjectEvent(`finish_${this.nowStage}`)
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
    changeCameraAngle(angle: 0 | 1 | 2 | 3) {
        const targetPosition = new Vector3()
        switch (angle) {
            case 0:
                targetPosition.set(250, 250, 250)
                break
            case 1:
                targetPosition.set(-250, 250, 250)
                break
            case 2:
                targetPosition.set(250, 250, -250)
                break
            case 3:
                targetPosition.set(-250, 250, -250)
                break
        }
        /*if ((targetPosition.x !== Math.round(this.camera.position.x)) && (targetPosition.z !== Math.round(this.camera.position.z))) {
            const tmpPosition = new Vector3().copy(targetPosition)
            tmpPosition.x = -tmpPosition.x
            animate({
                to: [this.camera.position, tmpPosition, targetPosition],
                onUpdate: v => {
                    this.camera.position.copy(v)
                    this.camera.lookAt(this.scene.position)
                },
                duration: 1000
            })
        }
        else */
        animate({
            from: this.camera.position,
            to: targetPosition,
            onUpdate: v => {
                this.camera.position.copy(v)
                this.camera.lookAt(this.scene.position)
            },
            duration: 1000
        })
    }
    detachCollide(obj: Cube | DrawBox | Rotator) {
        return false
        if (obj.objectType === "Mirror")
            return false
        const tmpBoxs = obj.children.map(x => new Box3().setFromObject(x))
        //console.log(tmpBoxs)
        let flag = false
        out:
        for (const c of this.allCubes) {
            if (c.uuid === obj.uuid)
                continue
            for (const p of tmpBoxs) {
                if (c.detechCollide(p)) {
                    flag = true
                    //console.log(new Box3().setFromObject(c.children[0]))
                    break out
                }
            }
        }
        //console.log(flag)
        if (flag) {
            if (obj.userData.originalPosition)
                obj.position.copy(obj.userData.originalPosition)
        }
        else {
            obj.userData.originalPosition = new Vector3().copy(obj.position)
        }
        return flag
    }

}

export default Level