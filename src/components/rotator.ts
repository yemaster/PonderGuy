import Component from "@/base/component"
import { unitWidth, type faceType } from "@/base/constants"
import { isCollide } from "@/base/methods"
import { animate } from "popmotion"
import { Plane, Mesh, type ColorRepresentation, BoxGeometry, Vector3, MeshLambertMaterial, Raycaster, Box3 } from "three"

const calcPos = (p: number, l: number = 1): number => {
    return (p || 0) * unitWidth + unitWidth * (l || 1) / 2
}

class Rotator extends Component {
    pos: [number, number, number];
    len: [number, number];
    startVector: Vector3 | null = null;
    mirrorInfo: { face: number } = { face: 0 }
    plane: Plane;
    angle: number;
    face: [faceType, faceType];
    enabled: boolean = true;
    direction: number = 1; // 0:x, 1:y, 2:z
    angleAccumulate: number = 0;

    constructor(...args: any) {
        super(...args)
        this.movable = true
        this.objectType = "Rotator"
        this.pos = args?.[0] || [0, 0, 0]
        this.len = args?.[1] || [4, 4]
        this.angle = args?.[3] || 0
        this.face = args?.[5] || ["+x", "+y"]
        this.direction = args?.[4] || 0
        this.plane = new Plane(new Vector3(0, 1, 0), -calcPos(this.pos[1], 1))
        this.color = args?.[2] || "#fb8888"

        this.setFace(this.face)
        this.setDirection(this.direction)
    }

    setFace(face: [faceType, faceType]) {
        this.face = face
        //console.log(face)
        const c1 = this.children[0] as Mesh
        const c2 = this.children[1] as Mesh

        function setBoxGeometry(c: Mesh, len: number, axis: ("x" | "y" | "z")) {
            c.geometry.dispose()
            const dimensions = {
                "x": [len, 1, 1],
                "y": [1, len, 1],
                "z": [1, 1, len]
            };
            const dimensionsForAxis = dimensions[axis] as [number, number, number];
            c.geometry = new BoxGeometry(...dimensionsForAxis.map(value => unitWidth * value));
        }

        const axis1 = face[0][1] as ("x" | "y" | "z");
        setBoxGeometry(c1, this.len[0], axis1);

        const axisValues = ["x", "y", "z"] as ("x" | "y" | "z")[];

        for (const i of axisValues) {
            if (i === axis1) {
                const offset = face[0][0] === "+" ? -1 / 2 : (1 / 2 - this.len[0]);
                c1.position[i] = calcPos(offset, this.len[0]);
            } else {
                c1.position[i] = calcPos(-1 / 2);
            }
        }

        const axis2 = face[1][1] as ("x" | "y" | "z");
        setBoxGeometry(c2, this.len[1], axis2);

        for (const i of axisValues) {
            if (i === axis2) {
                const offset = face[1][0] === "+" ? -1 / 2 : (1 / 2 - this.len[1]);
                c2.position[i] = calcPos(offset, this.len[1]);
            } else {
                c2.position[i] = calcPos(-1 / 2);
            }
        }

        function reverseFace(f: ("+" | "-")) {
            if (f === "+")
                return "-"
            else
                return "+"
        }
        const mirrorAxis = ["x", "y", "z"][this.mirrorInfo.face]
        this.mirrorComponent?.setFace([
            (face[0][1] !== mirrorAxis ? face[0][0] : reverseFace(face[0][0] as ("+" | "-"))) + face[0][1],
            (face[1][1] !== mirrorAxis ? face[1][0] : reverseFace(face[1][0] as ("+" | "-"))) + face[1][1],
        ])
    }

    setDirection(direction: number) {
        this.direction = (Math.floor(direction) || 0) % 3
        this.setAngle(this.angle)
        //console.log("Direction:", this.direction, this.pos)
        this.plane = new Plane(new Vector3(Number(this.direction === 0), Number(this.direction === 1), Number(this.direction === 2)), -calcPos(this.pos[this.direction], 1))
        this.mirrorComponent?.setDirection(this.direction)
    }

    setAngle(angle: number) {
        this.angle = ((Math.floor(angle) || 0) % 4 + 4) % 4
        //console.log(this.angle)
        const rot: [number, number, number] = [0, 0, 0]
        rot[this.direction] = Math.PI * angle / 2
        //console.log(rot)
        this.rotation.x = rot[0]
        this.rotation.y = rot[1]
        this.rotation.z = rot[2]

        this.mirrorComponent?.setAngle(this.angle * ((this.mirrorInfo.face === this.direction) ? 1 : -1))
    }

    setPos(pos: [number, number, number]) {
        this.pos = pos
        this.position.set(unitWidth * (pos[0] + 1 / 2), unitWidth * (pos[1] + 1 / 2), unitWidth * (pos[2] + 1 / 2))
    }
    setPosAnimate(pos: [number, number, number]) {
        this.pos = pos
        const target = new Vector3(unitWidth * (pos[0] + 1 / 2), unitWidth * (pos[1] + 1 / 2), unitWidth * (pos[2] + 1 / 2))
        animate({
            from: this.position,
            to: target,
            onUpdate: (l) => {
                this.position.copy(l)
            }
        })
    }

    setSize(len: [number, number]) {
        this.len = len

        this.setFace(this.face)
        this.mirrorComponent?.setSize([this.len[0], this.len[1]])
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

    generateElement(...args: any): void {
        this.generateDrawbox(args[0], args[1], args[2])
    }

    generateDrawbox(pos: [number, number, number], len: [number, number], color: ColorRepresentation = 0xfb8888) {
        const geometry1 = new BoxGeometry(unitWidth * len[0], unitWidth, unitWidth)
        const material = new MeshLambertMaterial({ color })
        const box1 = new Mesh(geometry1, material)

        box1.position.x = calcPos(-1 / 2, len[0])
        box1.position.y = calcPos(-1 / 2)
        box1.position.z = calcPos(-1 / 2)
        //console.log("POs1", box1.position)

        const geometry2 = new BoxGeometry(unitWidth, unitWidth, unitWidth * len[1])
        const box2 = new Mesh(geometry2, material)

        box2.position.x = calcPos(-1 / 2)
        box2.position.y = calcPos(-1 / 2)
        box2.position.z = calcPos(-1 / 2, len[1])
        //console.log("POS2", box1.position)

        this.add(box1)
        this.add(box2)

        //this.position.set(-unitWidth / 2, -unitWidth / 2, -unitWidth / 2)
        //this.rotation.y = this.angle * Math.PI / 2
        this.position.set(unitWidth * (pos[0] + 1 / 2), unitWidth * (pos[1] + 1 / 2), unitWidth * (pos[2] + 1 / 2))

        //const geometry = new PlaneGeometry(1000, 1000)
        //const material2 = new MeshBasicMaterial({ opacity: 0 })
        //const plane = new Mesh(geometry, material2)
        //plane.rotation.x = -0.5 * Math.PI

        //this.add(plane)
    }

    onDragStart(raycaster: Raycaster) {
        if (!this.enabled)
            return
        this.angleAccumulate = this.angle * Math.PI / 2
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
        //console.log(this.plane)
        raycaster.ray.intersectPlane(this.plane, pos)
        pos.sub({ x: calcPos(this.pos[0]), y: calcPos(this.pos[1]), z: calcPos(this.pos[2]) })
        //console.log(new Vector3().subVectors(this.startVector, pos))
        const tmpVector = new Vector3()
        tmpVector.crossVectors(this.startVector, pos)

        let angle = this.startVector?.angleTo(pos) || 0
        this.startVector = pos
        this.position.set(unitWidth / 2, unitWidth / 2, unitWidth / 2)

        angle *= (this.direction === 0 && tmpVector.x < 0) ||
            (this.direction === 1 && tmpVector.y < 0) ||
            (this.direction === 2 && tmpVector.z < 0) ? -1 : 1;
        this.angleAccumulate += angle
        this.angleAccumulate = (this.angleAccumulate % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)

        this.rotation.fromArray([0, 1, 2].map(d => this.angleAccumulate * Number(d === this.direction)) as [number, number, number])

        this.position.set(unitWidth * (this.pos[0] + 1 / 2), unitWidth * (this.pos[1] + 1 / 2), unitWidth * (this.pos[2] + 1 / 2))

        if (this.mirrorComponent) {
            this.mirrorComponent.position.set(unitWidth / 2, unitWidth / 2, unitWidth / 2)
            this.mirrorComponent.rotation.fromArray([0, 1, 2].map(d => this.angleAccumulate * Number(d === this.direction) * ((this.mirrorInfo.face === this.direction) ? 1 : -1)) as [number, number, number])
            this.mirrorComponent.position.set(unitWidth * (this.mirrorComponent.pos[0] + 1 / 2), unitWidth * (this.mirrorComponent.pos[1] + 1 / 2), unitWidth * (this.mirrorComponent.pos[2] + 1 / 2))
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

        angle *= (this.direction === 0 && tmpVector.x < 0) ||
            (this.direction === 1 && tmpVector.y < 0) ||
            (this.direction === 2 && tmpVector.z < 0) ? -1 : 1;
        this.angleAccumulate += angle
        this.angle = Math.round(this.angleAccumulate * 2 / Math.PI)
        this.angle = (this.angle % 4 + 4) % 4
        this.angleAccumulate = this.angle * Math.PI / 2
        this.rotation.fromArray([0, 1, 2].map(d => this.angleAccumulate * Number(d === this.direction)) as [number, number, number])

        this.position.set(unitWidth * (this.pos[0] + 1 / 2), unitWidth * (this.pos[1] + 1 / 2), unitWidth * (this.pos[2] + 1 / 2))

        //console.log(this.angle)
        this.mirrorComponent?.setAngle(this.angle * ((this.mirrorInfo.face === this.direction) ? 1 : -1))
        //console.log(this.mirrorComponent?.rotation)
    }


    detechCollide(box: Box3): boolean {
        const box1 = this.children[0] as Mesh
        const box2 = this.children[0] as Mesh
        const myBox1 = new Box3().setFromObject(box1)
        const myBox2 = new Box3().setFromObject(box2)
        return isCollide(box, myBox1) || isCollide(box, myBox2)
    }
}

export default Rotator