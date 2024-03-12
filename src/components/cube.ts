import Component from "@/base/component"
import { unitWidth } from "@/base/constants"
import { calcPos, isCollide } from "@/base/methods";
import { BoxGeometry, Mesh, MeshLambertMaterial, type ColorRepresentation, Matrix4, Box3, Vector3 } from "three"
import { animate } from "popmotion"

class Cube extends Component {
    pos: [number, number, number];
    constructor(...args: any) {
        super(...args)
        this.objectType = "Cube"
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
    setPosAnimate(pos: [number, number, number]) {
        this.pos = pos
        const target = new Vector3(calcPos(pos[0], 1), calcPos(pos[1], 1), calcPos(pos[2], 1))
        animate({
            from: this.children[0].position,
            to: target,
            onUpdate: (l) => {
                this.children[0].position.copy(l)
            }
        })
    }

    setColor(color: string) {
        this.color = color
        const frcolor = "#" + ((this.children[0] as Mesh).material as MeshLambertMaterial).color.getHexString()
        animate({
            from: frcolor,
            to: color,
            onUpdate: (l) => {
                ((this.children[0] as Mesh).material as MeshLambertMaterial).color.setStyle(l)
                if (this.mirrorComponent)
                    ((this.mirrorComponent.children[0] as Mesh).material as MeshLambertMaterial).color.setStyle(l)
            }
        })
    }

    detechCollide(box: Box3): boolean {
        const box1 = this.children[0] as Mesh
        const myBox = new Box3().setFromObject(box1)
        return isCollide(box, myBox)
    }
}
(Cube as any).cnName = "正方体";
(Cube as any).enName = "Cube";
export default Cube