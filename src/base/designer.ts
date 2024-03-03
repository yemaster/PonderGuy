import { BoxGeometry, Mesh, MeshBasicMaterial, Vector3, type OrthographicCamera, type Scene, type Vector3Like, WebGLRenderer } from "three"
import { unitWidth, type objectInfo, type MirrorInfo } from "./constants";
import Cube from "@/components/cube";
import DrawBox from "@/components/drawbox";
import { DragControls } from "three/examples/jsm/Addons.js";
import Rotator from "@/components/rotator";
import Mirror from "@/components/mirror";


export default class Designer {
    scene: Scene;
    camera: OrthographicCamera;
    renderer: WebGLRenderer;

    startPos: Vector3 | undefined = undefined;
    tingyun: Mesh[] = [];
    objects: any[] = [];
    ponder: Mesh | undefined;
    drawObjs: any[] = [];
    mirror: Mirror | undefined;

    dragControl: DragControls;
    constructor(scene: Scene, camera: OrthographicCamera, renderer: WebGLRenderer, startPos: [number, number, number]) {
        this.scene = scene
        this.camera = camera
        this.renderer = renderer

        this.startPos = new Vector3().fromArray(startPos)
        this.setupPonder(this.startPos)

        this.dragControl = new DragControls([], this.camera, this.renderer.domElement)
    }

    setupPonder(pos: Vector3) {
        const ponderGeometry = new BoxGeometry(6, 12, 6)
        const ponderMaterial = new MeshBasicMaterial({ color: 0x47af50 })
        this.ponder = new Mesh(ponderGeometry, ponderMaterial)
        this.ponder.position.set(
            pos.x * unitWidth + unitWidth / 2,
            (pos.y + 1) * unitWidth + 6,
            pos.z * unitWidth + unitWidth / 2
        )
        this.scene.add(this.ponder)
    }

    changePonderPos(pos: [number, number, number]) {
        if (this.ponder === undefined)
            return
        this.ponder.position.set(
            pos[0] * unitWidth + unitWidth / 2,
            (pos[1] + 1) * unitWidth + 6,
            pos[2] * unitWidth + unitWidth / 2
        )
    }

    addNewTingyun(pos: [number, number, number]) {
        const tingyunGeometry = new BoxGeometry(6, 12, 6)
        const tingyunMaterial = new MeshBasicMaterial({ color: 0xdb2828 })
        const tingyun = new Mesh(tingyunGeometry, tingyunMaterial)

        tingyun.position.set(
            pos[0] * unitWidth + unitWidth / 2,
            (pos[1] + 1) * unitWidth + 6,
            pos[2] * unitWidth + unitWidth / 2
        )

        this.tingyun.push(tingyun)
        this.scene.add(tingyun)
    }

    deleteTingyun(p: number) {
        if (this.tingyun[p] === undefined)
            return
        this.tingyun[p].geometry.dispose()
        this.scene.remove(this.tingyun[p])
        this.tingyun.splice(p, 1)
    }

    changeTingyunPos(p: number, pos: [number, number, number]) {
        if (this.tingyun[p] === undefined)
            return
        this.tingyun[p].position.set(
            pos[0] * unitWidth + unitWidth / 2,
            (pos[1] + 1) * unitWidth + 6,
            pos[2] * unitWidth + unitWidth / 2
        )
    }

    setupDragControl() {
        this.dragControl = new DragControls(this.drawObjs, this.camera, this.renderer.domElement)
        this.dragControl.addEventListener("dragstart", (e) => {
            const target = e.object.parent as any
            if (target.onControlDragStart)
                target.onControlDragStart(e)
        })
        this.dragControl.addEventListener("drag", (e) => {
            const target = e.object.parent as any
            if (target.onControlDrag)
                target.onControlDrag(e)
        })
        this.dragControl.addEventListener("dragend", (e) => {
            const target = e.object.parent as any
            if (target.onControlDragEnd)
                target.onControlDragEnd(e)
        })
    }

    addNewObject(info: objectInfo, pos?: number) {
        if (pos && this.objects[pos] === undefined)
            return
        let tmpObj: any
        info.pos = info.pos || [0, 0, 0]
        switch (info.type) {
            case "Cube":
                tmpObj = new Cube(info.pos, info.color)
                pos ? this.objects[pos] = tmpObj : this.objects.push(tmpObj)
                break
            case "Drawbox":
                tmpObj = new DrawBox(info.pos, info.size, info.range, info.color)
                pos ? this.objects[pos] = tmpObj : this.objects.push(tmpObj)
                this.drawObjs.push(tmpObj)
                break
            case "Rotator":
                tmpObj = new Rotator(info.pos, info.size, info.color, info.angle, info.direction, info.face)
                pos ? this.objects[pos] = tmpObj : this.objects.push(tmpObj)
                break
        }
        this.scene.add(tmpObj)
        this.dragControl.dispose()
        this.setupDragControl()
        if (this.mirror) {
            pos ? this.mirror.realObjs[pos] = tmpObj : this.mirror.realObjs.push(tmpObj)
            this.mirror.updateMirrorCubePos()
        }
    }

    deleteObject(p: number) {
        if (this.objects[p] === undefined)
            return
        if (this.mirror) {
            this.mirror.realObjs.splice(p, 1)
            this.mirror.updateMirrorCubePos()
        }
        const d = this.objects[p]
        if (this.mirror && d.mirrorComponent) {
            this.mirror.inMirrorObjs.splice(this.mirror.inMirrorObjs.indexOf(d.mirrorComponent), 1)
            d.mirrorComponent.children.forEach((v: any) => {
                v.geometry?.dispose()
            })
            this.scene.remove(d.mirrorComponent)
        }
        this.drawObjs.splice(this.drawObjs.indexOf(d), 1)
        d.children.forEach((v: any) => {
            v.geometry?.dispose()
        })
        this.scene.remove(d)
        this.objects.splice(p, 1)
        this.dragControl.dispose()
        this.setupDragControl()
    }

    changeObjectInfo(p: number, info: objectInfo) {
        if (this.objects[p] === undefined)
            return
        const d = this.objects[p]
        if (d.name !== info.type) {
            this.drawObjs.splice(this.drawObjs.indexOf(d), 1)
            d.children.forEach((v: any) => {
                v.geometry?.dispose()
            })
            this.scene.remove(d)
            this.objects[p] = undefined
            this.addNewObject(info, p)
        }
        else {
            if (info.pos && d.setPos)
                d.setPos(info.pos)
            if ((info.angle || info.angle === 0) && d.setAngle)
                d.setAngle(info.angle)
            if (info.size && d.setSize)
                d.setSize(info.size)
            if (info.color && d.setColor)
                d.setColor(info.color)
            if ((info.direction || info.direction === 0) && d.setDirection)
                d.setDirection(info.direction)
            if ((info.face || info.face === 0) && d.setFace)
                d.setFace(info.face)
            console.log(d.name, info.pos)
        }
        if (this.mirror)
            this.mirror.updateMirrorCubePos()
    }

    setupMirror(info: MirrorInfo) {
        if (this.mirror)
            this.mirror.dispose()
        this.mirror = new Mirror(info.pos, info.size, info.range)
        this.mirror.setupMirrorCubes(Array.from(this.objects), this.scene)
        this.scene.add(this.mirror)
        this.drawObjs.push(this.mirror)
        this.dragControl.dispose()
        this.setupDragControl()
    }

    changeMirrorInfo(info: MirrorInfo) {
        if (!this.mirror)
            return
        if (info.pos)
            this.mirror.setPos(info.pos)
        if (info.size)
            this.mirror.setSize(info.size)
        if (info.range)
            this.mirror.setRange(info.range)
        this.mirror.updateMirrorCubePos()
    }

    disposeMirror() {
        if (this.mirror) {
            this.drawObjs.splice(this.drawObjs.indexOf(this.mirror), 1)
            this.mirror.dispose()
            this.scene.remove(this.mirror)
        }
        this.mirror = undefined
        this.dragControl.dispose()
        this.setupDragControl()
    }
}