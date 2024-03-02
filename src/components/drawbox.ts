import Component from "@/base/component"
import { unitWidth } from "@/base/constants"
import { Mesh, type ColorRepresentation, MeshLambertMaterial, BoxGeometry } from "three"
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
    range: [number[], number[], number[]];
    mirrorInfo: { pos: [number, number, number], face: number } = { pos: [0, 0, 0], face: 0 }

    constructor(...args: any) {
        super(...args)
        this.movable = true
        this.name = "Drawbox"
        this.pos = args?.[0] || [0, 0, 0]
        this.len = args?.[1] || [1, 1, 1]
        this.range = args?.[2] || [[1], [1], [1]]
    }

    generateElement(...args: any): void {
        this.generateDrawbox(args[0], args[1], args[3])
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

    setSize(size: [number, number, number]) {
        this.len = size
        this.children.forEach(e => {
            const t = e as Mesh
            t?.geometry.dispose()
            t.geometry = new BoxGeometry(unitWidth * (size[0] || 1), unitWidth * (size[1] || 1), unitWidth * (size[2] || 1))
            t.position.x = calcPos(this.pos[0], size[0])
            t.position.y = calcPos(this.pos[1], size[1])
            t.position.z = calcPos(this.pos[2], size[2])
        })
    }

    setRange(range: [number[], number[], number[]]) {
        this.range = range
    }

    onControlDrag(e: any) {
        const tmp = e.object.position.toArray()
        for (let i = 0; i < 3; ++i) {
            if (this.range[i].length === 2 && this.range[i][0] < this.range[i][1]) {
                if (tmp[i] <= calcPos(this.range[i][0], this.len[i]))
                    tmp[i] = calcPos(this.range[i][0], this.len[i])
                if (tmp[i] >= calcPos(this.range[i][1], this.len[i]))
                    tmp[i] = calcPos(this.range[i][1], this.len[i])
            }
            else
                tmp[i] = calcPos(this.pos[i], this.len[i])
        }
        e.object.position.fromArray(tmp)

        if (this.mirrorComponent) {
            let tmpPos: [number, number, number] = [0, 0, 0]
            for (let i = 0; i < tmpPos.length; ++i)
                tmpPos[i] = (tmp[i] - unitWidth * (this.len[i] || 1) / 2) / unitWidth

            tmpPos = calcMirrorPos(tmpPos, this.mirrorInfo.pos, this.mirrorInfo.face)
            tmpPos[this.mirrorInfo.face] -= this.len[this.mirrorInfo.face] - 1;
            this.mirrorComponent.setPos(tmpPos)
        }
    }

    onControlDragEnd(e: any) {
        const tmp = e.object.position.toArray()
        for (let i = 0; i < 3; ++i) {
            this.pos[i] = fixPos(tmp[i], this.len[i])
            tmp[i] = calcPos(this.pos[i], this.len[i])
        }
        e.object.position.fromArray(tmp)

        if (this.mirrorComponent) {
            const tmpPos = calcMirrorPos(this.pos, this.mirrorInfo.pos, this.mirrorInfo.face)
            tmpPos[this.mirrorInfo.face] -= this.len[this.mirrorInfo.face] - 1;
            this.mirrorComponent.setPos(tmpPos)
        }
    }

    onDragEnd() { }
}

export default DrawBox