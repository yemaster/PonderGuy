import Component from "@/base/component"
import { unitWidth } from "@/base/constants"
import { calcMirrorAngle } from "@/base/methods"
import { Plane, Mesh, type ColorRepresentation, BoxGeometry, Vector3, MeshLambertMaterial, Raycaster } from "three"

const calcPos = (p: number, l: number = 1): number => {
    return (p || 0) * unitWidth + unitWidth * (l || 1) / 2
}

class Rotator extends Component {
    pos: [number, number, number];
    len: number;
    startVector: Vector3 | null = null;
    mirrorInfo: { face: number } = { face: 0 }
    plane: Plane;
    angle: number;
    enabled: boolean = true;

    constructor(...args: any) {
        super(...args)
        this.movable = true
        this.name = "Rotator"
        this.pos = args?.[0] || [0, 0, 0]
        this.len = args?.[1] || 1
        this.angle = args?.[3] || 0;
        this.plane = new Plane(new Vector3(0, 1, 0), -calcPos(this.pos[1], 1))

        this.setAngle(this.angle)
    }

    setAngle(angle: number) {
        this.angle = (Math.floor(angle) || 0) % 4
        let rot: [number, number, number] = [0, 0, 0]
        switch (angle) {
            case 1:
                rot = [0, Math.PI / 2, 0]
                break;
            case 2:
                rot = [Math.PI, 0, Math.PI]
                break;
            case 3:
                rot = [0, 3 * Math.PI / 2, 0]
                break;
        }
        this.rotation.fromArray(rot);
    }

    setPos(pos: [number, number, number]) {
        this.pos = pos
        this.position.set(unitWidth * (pos[0] + 1 / 2), unitWidth * pos[1], unitWidth * (pos[2] + 1 / 2))
    }

    setSize(len: number) {
        this.len = len
        const box1 = this.children[0] as Mesh
        const box2 = this.children[1] as Mesh

        box1.geometry.dispose()
        box1.geometry = new BoxGeometry(unitWidth * len, unitWidth, unitWidth)

        box1.position.x = calcPos(-1 / 2, len)
        box1.position.y = calcPos(0)
        box1.position.z = calcPos(-1 / 2)

        box2.geometry.dispose()
        box2.geometry = new BoxGeometry(unitWidth, unitWidth, unitWidth * len)

        box2.position.x = calcPos(-1 / 2)
        box2.position.y = calcPos(0)
        box2.position.z = calcPos(-1 / 2, len)
    }

    generateElement(...args: any): void {
        this.generateDrawbox(args[0], args[1], args[2])
    }

    generateDrawbox(pos: [number, number, number], len: number, color: ColorRepresentation = 0xfb8888) {
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

    onDragStart(raycaster: Raycaster) {
        if (!this.enabled)
            return
        const pos = new Vector3()
        raycaster.ray.intersectPlane(this.plane, pos)
        this.startVector = pos.sub({ x: calcPos(this.pos[0]), y: calcPos(this.pos[1]), z: calcPos(this.pos[2]) })
    }

    onDrag(raycaster: Raycaster) {
        if (!this.enabled)
            return
        if (this.startVector === null)
            return
        const pos = new Vector3()
        raycaster.ray.intersectPlane(this.plane, pos)
        pos.sub({ x: calcPos(this.pos[0]), y: calcPos(this.pos[1]), z: calcPos(this.pos[2]) })

        const tmpVector = new Vector3()
        tmpVector.crossVectors(this.startVector, pos)

        let angle = this.startVector?.angleTo(pos) || 0
        this.startVector = pos
        this.position.set(unitWidth / 2, unitWidth / 2, unitWidth / 2)

        if (tmpVector.y < 0)
            angle = -angle
        this.rotateY(angle)

        this.position.set(unitWidth * (this.pos[0] + 1 / 2), unitWidth * this.pos[1], unitWidth * (this.pos[2] + 1 / 2))

        if (this.mirrorComponent) {
            this.mirrorComponent.position.set(unitWidth / 2, unitWidth / 2, unitWidth / 2)
            this.mirrorComponent.rotateY(-angle)
            this.mirrorComponent.position.set(unitWidth * (this.mirrorComponent.pos[0] + 1 / 2), unitWidth * this.mirrorComponent.pos[1], unitWidth * (this.mirrorComponent.pos[2] + 1 / 2))
        }
    }

    onDragEnd(raycaster: Raycaster) {
        if (!this.enabled)
            return
        if (this.startVector === null)
            return
        const pos = new Vector3()
        raycaster.ray.intersectPlane(this.plane, pos)
        pos.sub({ x: calcPos(this.pos[0]), y: calcPos(this.pos[1]), z: calcPos(this.pos[2]) })

        const tmpVector = new Vector3()
        tmpVector.crossVectors(this.startVector, pos)

        let angle = this.startVector?.angleTo(pos) || 0
        this.startVector = pos
        this.position.set(-unitWidth / 2, -unitWidth / 2, -unitWidth / 2)

        if (tmpVector.y < 0)
            angle = -angle
        this.rotateY(angle)

        this.position.set(unitWidth * (this.pos[0] + 1 / 2), unitWidth * this.pos[1], unitWidth * (this.pos[2] + 1 / 2))
        const rot = this.rotation.toArray() as [number, number, number]
        for (let i = 0; i < 3; ++i) {
            rot[i] = Math.round(2 * rot[i] / Math.PI)
            rot[i] = (rot[i] % 4 + 4) % 4
        }
        this.angle = rot[1]
        if (![0, 1, 2, 3].includes(this.angle))
            this.angle = 0
        if (this.angle === 0 && rot[0] === 2) {
            this.angle = 2
        }
        for (let i = 0; i < 3; ++i) {
            rot[i] = rot[i] * Math.PI / 2
        }
        this.rotation.fromArray(rot)

        this.angle = (this.angle % 4 + 4) % 4
        if (this.mirrorComponent)
            this.mirrorComponent.setAngle(calcMirrorAngle(this.angle, this.mirrorInfo.face))
        //console.log(this.rotation)
    }
}

export default Rotator