import Component from "@/base/component"
import { unitWidth } from "@/base/constants"
import { Mesh, type ColorRepresentation, MeshLambertMaterial, BoxGeometry } from "three"
import { DragControls } from "three/examples/jsm/Addons.js"
import { calcMirrorPos } from "@/base/methods"

const calcPos = (p: number, l: number = 1): number => {
    return p * unitWidth + unitWidth * (l || 1) / 2
}

const fixPos = (p: number, l: number = 1): number => {
    return Math.round((p - unitWidth * (l || 1) / 2) / unitWidth)
}

class DrawBox extends Component {
    pos: [number, number, number];
    len: [number, number, number];
    mirrorInfo: { pos: [number, number, number], face: number } = { pos: [0, 0, 0], face: 0 }

    constructor(...args: any) {
        super(...args)
        this.movable = true
        this.name = "Drawbox"
        this.pos = args?.[0] || [0, 0, 0]
        this.len = args?.[1] || [1, 1, 1]
    }

    generateElement(...args: any): void {
        this.generateDrawbox(args[0], args[1], args[2])
    }

    generateDrawbox(pos: [number, number, number], len: [number, number, number], color: ColorRepresentation = 0xffe21f) {
        const geometry = new BoxGeometry(unitWidth * (len[0] || 1), unitWidth * (len[1] || 1), unitWidth * (len[2] || 1))
        const material = new MeshLambertMaterial({ color })
        const drawbox = new Mesh(geometry, material)

        drawbox.position.x = calcPos(pos[0], len[0])
        drawbox.position.y = calcPos(pos[1], len[1])
        drawbox.position.z = calcPos(pos[2], len[2])

        this.add(drawbox)
    }

    setPos(pos: [number, number, number]) {
        this.pos = pos
        this.children.forEach(e => {
            e.position.x = calcPos(pos[0], this.len[0])
            e.position.y = calcPos(pos[1], this.len[1])
            e.position.z = calcPos(pos[2], this.len[2])
        })
    }

    setupController(controller: DragControls, range: number[][]) {
        const _t = this
        controller.addEventListener("drag", (e) => {
            const tmp = e.object.position.toArray()
            for (let i = 0; i < 3; ++i) {
                if (range[i].length === 2) {
                    if (tmp[i] <= calcPos(range[i][0], _t.len[i]))
                        tmp[i] = calcPos(range[i][0], _t.len[i])
                    if (tmp[i] >= calcPos(range[i][1], _t.len[i]))
                        tmp[i] = calcPos(range[i][1], _t.len[i])
                }
                else
                    tmp[i] = calcPos(_t.pos[i], _t.len[i])
            }
            e.object.position.fromArray(tmp)

            if ((e.object?.parent as any)?.mirrorComponent) {
                let tmpPos: [number, number, number] = [0, 0, 0]
                for (let i = 0; i < tmpPos.length; ++i)
                    tmpPos[i] = (tmp[i] - unitWidth * (_t.len[i] || 1) / 2) / unitWidth

                tmpPos = calcMirrorPos(tmpPos, _t.mirrorInfo.pos, _t.mirrorInfo.face)
                tmpPos[_t.mirrorInfo.face] -= _t.len[_t.mirrorInfo.face] - 1;
                (e.object.parent as any).mirrorComponent.setPos(tmpPos)
            }
        })
        controller.addEventListener("dragend", (e) => {
            const tmp = e.object.position.toArray()
            for (let i = 0; i < 3; ++i) {
                _t.pos[i] = fixPos(tmp[i], _t.len[i])
                tmp[i] = calcPos(_t.pos[i], _t.len[i])
            }
            e.object.position.fromArray(tmp)

            if ((e.object?.parent as any)?.mirrorComponent) {
                const tmpPos = calcMirrorPos(_t.pos, _t.mirrorInfo.pos, _t.mirrorInfo.face)
                tmpPos[_t.mirrorInfo.face] -= _t.len[_t.mirrorInfo.face] - 1;
                (e.object.parent as any).mirrorComponent.setPos(tmpPos)
            }
        })
    }

    onClickEnd() {
        //
    }
}

export default DrawBox