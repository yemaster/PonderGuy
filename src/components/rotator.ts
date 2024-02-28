import Component from "@/base/component"
import { unitWidth } from "@/base/constants"
import { Plane, Mesh, type ColorRepresentation, BoxGeometry, Vector3, MeshLambertMaterial, Raycaster } from "three"

const calcPos = (p: number, l: number = 1): number => {
    return (p || 0) * unitWidth + unitWidth * (l || 1) / 2
}

class Rotator extends Component {
    pos: number[];
    len: number;
    startVector: Vector3 | null = null;
    plane: Plane;
    angle: number;

    constructor(...args: any) {
        super(...args)
        this.movable = true
        this.name = "Rotator"
        this.pos = args?.[0] || [0, 0, 0]
        this.len = args?.[1] || 1
        this.angle = args?.[3] || 0;
        this.plane = new Plane(new Vector3(0, 1, 0), -calcPos(this.pos[1], 1))
    }

    generateElement(...args: any): void {
        this.generateDrawbox(args[0], args[1], args[2])
    }

    generateDrawbox(pos: number[], len: number, color: ColorRepresentation = 0xfb8888) {
        const geometry1 = new BoxGeometry(unitWidth * len, unitWidth, unitWidth)
        const material = new MeshLambertMaterial({ color })
        const box1 = new Mesh(geometry1, material)

        box1.position.x = calcPos(-1 / 2, len)
        box1.position.y = calcPos(0)
        box1.position.z = calcPos(-1 / 2)

        const geometry2 = new BoxGeometry(unitWidth, unitWidth, unitWidth * len)
        const box2 = new Mesh(geometry2, material)

        box2.position.x = calcPos(-1 / 2)
        box2.position.y = calcPos(0)
        box2.position.z = calcPos(-1 / 2, len)

        this.add(box1)
        this.add(box2)

        //this.position.set(-unitWidth / 2, -unitWidth / 2, -unitWidth / 2)
        //this.rotation.y = this.angle * Math.PI / 2
        this.position.set(unitWidth * (pos[0] + 1 / 2), unitWidth * pos[1], unitWidth * (pos[2] + 1 / 2))

        //const geometry = new PlaneGeometry(1000, 1000)
        //const material2 = new MeshBasicMaterial({ opacity: 0 })
        //const plane = new Mesh(geometry, material2)
        //plane.rotation.x = -0.5 * Math.PI

        //this.add(plane)
    }

    onClickStart(raycaster: Raycaster) {
        const pos = new Vector3()
        raycaster.ray.intersectPlane(this.plane, pos)
        this.startVector = pos.sub({ x: calcPos(this.pos[0]), y: calcPos(this.pos[1]), z: calcPos(this.pos[2]) })
    }

    onClick(raycaster: Raycaster) {
        const pos = new Vector3()
        raycaster.ray.intersectPlane(this.plane, pos)
        pos.sub({ x: calcPos(this.pos[0]), y: calcPos(this.pos[1]), z: calcPos(this.pos[2]) })

        const tmpVector = new Vector3()
        tmpVector.crossVectors(this.startVector, pos)

        const angle = this.startVector?.angleTo(pos) || 0
        this.startVector = pos
        this.position.set(unitWidth / 2, unitWidth / 2, unitWidth / 2)

        if (tmpVector.y > 0)
            this.rotateY(angle)
        else
            this.rotateY(-angle)
        this.position.set(unitWidth * (this.pos[0] + 1 / 2), unitWidth * this.pos[1], unitWidth * (this.pos[2] + 1 / 2))
    }

    onClickEnd(raycaster: Raycaster) {
        const pos = new Vector3()
        raycaster.ray.intersectPlane(this.plane, pos)
        pos.sub({ x: calcPos(this.pos[0]), y: calcPos(this.pos[1]), z: calcPos(this.pos[2]) })

        const tmpVector = new Vector3()
        tmpVector.crossVectors(this.startVector, pos)

        const angle = this.startVector?.angleTo(pos) || 0
        this.startVector = pos
        this.position.set(-unitWidth / 2, -unitWidth / 2, -unitWidth / 2)

        if (tmpVector.y > 0)
            this.rotateY(angle)
        else
            this.rotateY(-angle)
        this.position.set(unitWidth * (this.pos[0] + 1 / 2), unitWidth * this.pos[1], unitWidth * (this.pos[2] + 1 / 2))
        const rot = this.rotation.toArray()
        for (let i = 0; i < 3; ++i) {
            rot[i] = Math.round(2 * rot[i] / Math.PI)
            rot[i] = (rot[i] % 4 + 4) % 4
            rot[i] = rot[i] * Math.PI / 2
        }
        this.rotation.fromArray(rot)

        this.angle = Math.round(2 * this.rotation.y / Math.PI)
        if (this.angle === 0) {
            this.angle += Math.round(2 * this.rotation.x / Math.PI)
        }
        this.angle = (this.angle % 4 + 4) % 4
        //console.log(this.rotation)
    }
}

export default Rotator