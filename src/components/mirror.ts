import { unitWidth } from "@/base/constants"
import Cube from "@/components/cube"
import Rotator from "@/components/rotator"
import DrawBox from "@/components/drawbox"
import { PlaneGeometry, MeshBasicMaterial, Mesh, Scene, Vector3, Plane } from "three"
import Component from "@/base/component"
import { DragControls } from "three/examples/jsm/Addons.js"
import { calcPos, fixPos, calcMirrorPos, calcMirrorAngle } from "@/base/methods"

export default class Mirror extends Component {
    pos: [number, number, number];
    len: [number, number, number];
    inMirrorObjs: any[] = [];
    realObjs: any[] = [];
    clippingPlanes: Plane[] = [];

    constructor(...args: any) {
        super(...args)
        this.movable = true
        this.name = "Mirror"
        this.pos = args?.[0] || [0, 0, 0]
        this.len = args?.[1] || [1, 1, 0]
    }

    generateElement(...args: any): void {
        this.generateDrawbox(args[0], args[1])
    }

    generateDrawbox(pos: [number, number, number], len: [number, number, number]) {
        const geometry = new PlaneGeometry(unitWidth * (len[0] + len[2]), unitWidth * (len[1] || 1))
        const material = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
        const mirror = new Mesh(geometry, material)

        mirror.position.x = calcPos(pos[0], len[0], len[0] === 0)
        mirror.position.y = calcPos(pos[1], len[1])
        mirror.position.z = calcPos(pos[2], len[2], len[2] === 0)

        if (len[0] === 0)
            mirror.rotation.y = Math.PI / 2

        this.add(mirror)
    }

    setPos(pos: [number, number, number]) {
        this.pos = pos
        this.children.forEach(e => {
            e.position.x = calcPos(pos[0], this.len[0], this.len[0] === 0)
            e.position.y = calcPos(pos[1], this.len[1])
            e.position.z = calcPos(pos[2], this.len[2], this.len[2] === 0)
        })
    }

    handleObjectVisibility() {
        const face = this.len[0] === 0 ? 0 : 2
        const mirror = this.children[0]
        const left = (face === 2) ?
            ((mirror.position.x - unitWidth * this.len[0] / 2) / unitWidth) :
            ((mirror.position.z - unitWidth * this.len[2] / 2) / unitWidth)
        const right = left + this.len[0] + this.len[2]
        const bottom = (mirror.position.y - unitWidth * this.len[1] / 2) / unitWidth
        const top = bottom + this.len[1]

        this.clippingPlanes = [
            // Front
            new Plane().setFromNormalAndCoplanarPoint(
                (face === 2) ? new Vector3(0, 0, -1) : new Vector3(-1, 0, 0),
                (face === 2) ?
                    new Vector3(0, 0, this.pos[2] * unitWidth / 2) :
                    new Vector3(this.pos[0] * unitWidth / 2, 0, 0)),
            // Left
            new Plane().setFromNormalAndCoplanarPoint(
                (face === 2) ? new Vector3(1, 0, -1) : new Vector3(-1, 0, 1),
                (face === 2) ?
                    new Vector3(left * unitWidth / 2, 0, this.pos[2] * unitWidth / 2) :
                    new Vector3(this.pos[0] * unitWidth / 2, 0, left * unitWidth / 2)),
            // Right
            new Plane().setFromNormalAndCoplanarPoint(
                (face === 2) ? new Vector3(-1, 0, 1) : new Vector3(1, 0, -1),
                (face === 2) ?
                    new Vector3(right * unitWidth / 2, 0, this.pos[2] * unitWidth / 2) :
                    new Vector3(this.pos[0] * unitWidth / 2, 0, right * unitWidth / 2)),

            // Top
            new Plane().setFromNormalAndCoplanarPoint(
                (face === 2) ? new Vector3(0, -1, 1) : new Vector3(1, -1, 0),
                (face === 2) ?
                    new Vector3(0, top * unitWidth / 2, this.pos[2] * unitWidth / 2) :
                    new Vector3(this.pos[0] * unitWidth / 2, top * unitWidth / 2, 0)),
            // Bottom
            new Plane().setFromNormalAndCoplanarPoint(
                (face === 2) ? new Vector3(0, 1, -1) : new Vector3(-1, 1, 0),
                (face === 2) ?
                    new Vector3(0, bottom * unitWidth / 2, this.pos[2] * unitWidth / 2) :
                    new Vector3(this.pos[0] * unitWidth / 2, bottom * unitWidth / 2, 0)),
        ]
        //console.log(this.clippingPlanes, left * unitWidth, bottom * unitWidth, this.pos[2] * unitWidth)
        this.inMirrorObjs.forEach(v => {
            v.children.forEach((k: any) => {
                k.material.clippingPlanes = this.clippingPlanes
                k.material.clipIntersection = false
            })
        })

        const reverseClippingPlanes: Plane[] = []
        for (const i of this.clippingPlanes) {
            reverseClippingPlanes.push(i.clone().negate())
        }

        this.realObjs.forEach(v => {
            v.children.forEach((k: any) => {
                k.material.clippingPlanes = reverseClippingPlanes
                k.material.clipIntersection = true
            })
        })
    }

    setupController(controller: DragControls, range: number[][]) {
        controller.addEventListener("drag", (e) => {
            const tmp = e.object.position.toArray()
            for (let i = 0; i < 3; ++i) {
                if (range[i].length === 2) {
                    if (tmp[i] <= calcPos(range[i][0], this.len[i]))
                        tmp[i] = calcPos(range[i][0], this.len[i], this.len[i] === 0)
                    if (tmp[i] >= calcPos(range[i][1], this.len[i]))
                        tmp[i] = calcPos(range[i][1], this.len[i], this.len[i] === 0)
                }
                else
                    tmp[i] = calcPos(this.pos[i], this.len[i], this.len[i] === 0)
            }
            e.object.position.fromArray(tmp)
            this.handleObjectVisibility()
        })
        controller.addEventListener("dragend", (e) => {
            const tmp = e.object.position.toArray()
            for (let i = 0; i < 3; ++i) {
                this.pos[i] = fixPos(tmp[i], this.len[i])
                tmp[i] = calcPos(this.pos[i], this.len[i], this.len[i] === 0)
            }
            e.object.position.fromArray(tmp)
            this.handleObjectVisibility()
        })
    }

    onClickEnd() {
        //
    }

    setupMirrorCubes(objs: any[], scene: Scene) {
        const face = this.len[0] === 0 ? 0 : 2
        this.realObjs = objs
        objs.forEach(v => {
            let tmpObj: any
            let tmpPos: [number, number, number]
            if (v.pos[face] >= this.pos[face])
                switch (v.name) {
                    case "Cube":
                        tmpObj = new Cube(calcMirrorPos(v.pos, this.pos, face))
                        this.inMirrorObjs.push(tmpObj)
                        scene.add(tmpObj)
                        break
                    case "Rotator":
                        tmpObj = new Rotator(calcMirrorPos(v.pos, this.pos, face), v.len, undefined, calcMirrorAngle(v.angle, face))
                        tmpObj.enabled = false
                        v.mirrorComponent = tmpObj
                        v.mirrorInfo = {
                            face
                        }
                        this.inMirrorObjs.push(tmpObj)
                        scene.add(tmpObj)
                        break
                    case "Drawbox":
                        tmpPos = calcMirrorPos(v.pos, this.pos, face)
                        tmpPos[face] -= v.len[face]
                        tmpObj = new DrawBox(tmpPos, v.len, undefined)
                        v.mirrorComponent = tmpObj
                        v.mirrorInfo = {
                            pos: this.pos,
                            face
                        }
                        this.inMirrorObjs.push(tmpObj)
                        scene.add(tmpObj)
                        break
                }
        })
        this.handleObjectVisibility()
    }
}