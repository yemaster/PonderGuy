import Component from "@/base/component"
import { unitWidth } from "@/base/constants"
import { BoxGeometry, Mesh, MeshLambertMaterial, type ColorRepresentation, Matrix4, Vector3 } from "three"

class Cube extends Component {
    pos: Vector3;
    constructor(...args: any) {
        super(...args)
        this.name = "Cube"
        this.pos = args[0]
    }
    generateElement(...args: any) {
        this.generateCube(args[0], args?.[1])
    }
    generateCube(pos: number[], color: ColorRepresentation = 0x54c8ff) {
        const cubeGeometry = new BoxGeometry(unitWidth, unitWidth, unitWidth)
        const cubeMaterial = new MeshLambertMaterial({ color })
        const cube = new Mesh(cubeGeometry, cubeMaterial)

        cube.position.x = (pos[0] || 0) * unitWidth + Number(unitWidth / 2)
        cube.position.y = (pos[1] || 0) * unitWidth + Number(unitWidth / 2)
        cube.position.z = (pos[2] || 0) * unitWidth + Number(unitWidth / 2)

        cube.applyMatrix4(new Matrix4().makeScale(1, 1, 1))
        this.add(cube)
    }
}
(Cube as any).cnName = "正方体";
(Cube as any).enName = "Cube";
export default Cube