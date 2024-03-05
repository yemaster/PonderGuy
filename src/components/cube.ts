import Component from "@/base/component"
import { unitWidth } from "@/base/constants"
import { calcPos } from "@/base/methods";
import { BoxGeometry, Mesh, MeshLambertMaterial, type ColorRepresentation, Matrix4 } from "three"

class Cube extends Component {
    pos: [number, number, number];
    constructor(...args: any) {
        super(...args)
        this.name = "Cube"
        this.pos = args[0]
        this.color = args?.[1] || "#54c8ff"
    }
    generateElement(...args: any) {
        this.generateCube(args[0], args?.[1])
    }
    generateCube(pos: number[], color: ColorRepresentation = 0x54c8ff) {
        const cubeGeometry = new BoxGeometry(unitWidth, unitWidth, unitWidth)

        const cubeMaterial = new MeshLambertMaterial({ color })
        const cube = new Mesh(cubeGeometry, cubeMaterial)

        cube.position.x = calcPos(pos[0], 1)
        cube.position.y = calcPos(pos[1], 1)
        cube.position.z = calcPos(pos[2], 1)

        cube.applyMatrix4(new Matrix4().makeScale(1, 1, 1))
        this.add(cube)
    }

    setPos(pos: [number, number, number]) {
        this.pos = pos
        this.children.forEach(e => {
            e.position.x = calcPos(pos[0], 1)
            e.position.y = calcPos(pos[1], 1)
            e.position.z = calcPos(pos[2], 1)
        })
    }

    setColor(color: string) {
        this.color = color
        this.children.forEach(v => {
            (v as any)?.material?.color.setStyle(color)
        })
        if (this.mirrorComponent)
            this.mirrorComponent.children.forEach((v: any) => {
                v?.material?.color.setStyle(color)
            })
    }
}
(Cube as any).cnName = "正方体";
(Cube as any).enName = "Cube";
export default Cube