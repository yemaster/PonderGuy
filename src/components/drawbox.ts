import Component from "@/base/component"
import { unitWidth } from "@/base/constants"
import { Mesh, type ColorRepresentation, MeshLambertMaterial, BoxGeometry, Raycaster, Plane, OrthographicCamera, PerspectiveCamera, Vector3 } from "three"
import { DragControls } from "three/examples/jsm/Addons.js"

const calcPos = (p: number, l: number = 1): number => {
    return (p || 0) * unitWidth + unitWidth * (l || 1) / 2
}

const fixPos = (p: number, l: number = 1): number => {
    return Math.round((p - unitWidth * (l || 1) / 2) / unitWidth)
}

class DrawBox extends Component {
    pos: number[];
    len: number[];
    plane: Plane;
    worldPosition: Vector3;

    constructor(...args: any) {
        super(...args)
        this.movable = true
        this.name = "Drawbox"
        this.pos = args?.[0] || [0, 0, 0]
        this.len = args?.[1] || [1, 1, 1]
        this.plane = new Plane()
        this.worldPosition = new Vector3()
    }

    generateElement(...args: any): void {
        this.generateDrawbox(args[0], args[1], args[2])
    }

    generateDrawbox(pos: number[], len: number[], color: ColorRepresentation = 0xffe21f) {
        const geometry = new BoxGeometry(unitWidth * (len[0] || 1), unitWidth * (len[1] || 1), unitWidth * (len[2] || 1))
        const material = new MeshLambertMaterial({ color })
        const drawbox = new Mesh(geometry, material)

        drawbox.position.x = calcPos(pos[0], len[0])
        drawbox.position.y = calcPos(pos[1], len[1])
        drawbox.position.z = calcPos(pos[2], len[2])

        this.add(drawbox)
    }

    setupController(controller: DragControls, range: number[][]) {
        controller.addEventListener("drag", (e) => {
            const tmp = e.object.position.toArray()
            for (let i = 0; i < 3; ++i) {
                if (range[i].length === 2) {
                    if (tmp[i] <= calcPos(range[i][0], this.len[i]))
                        tmp[i] = calcPos(range[i][0], this.len[i])
                    if (tmp[i] >= calcPos(range[i][1], this.len[i]))
                        tmp[i] = calcPos(range[i][1], this.len[i])
                }
                else
                    tmp[i] = calcPos(this.pos[i], this.len[i])
            }
            e.object.position.fromArray(tmp)
        })
        controller.addEventListener("dragend", (e) => {
            const tmp = e.object.position.toArray()
            for (let i = 0; i < 3; ++i) {
                this.pos[i] = fixPos(tmp[i], this.len[i])
                tmp[i] = calcPos(this.pos[i], this.len[i])
            }
            e.object.position.fromArray(tmp)
        })
    }

    onClickEnd(raycaster: Raycaster) {
        //
    }
}

export default DrawBox