import { PlaneGeometry, Mesh, type ColorRepresentation, MeshLambertMaterial } from "three"

class Plane {
    obj: Mesh;

    constructor(pos: number[], color: ColorRepresentation = 0xeeeeee) {
        const geometry = new PlaneGeometry(200, 200)
        const material = new MeshLambertMaterial({ color })
        this.obj = new Mesh(geometry, material)

        this.obj.rotation.x = -0.5 * Math.PI
        this.obj.position.x = (pos[0] || 0) + 100
        this.obj.position.y = 0
        this.obj.position.z = (pos[2] || 0) + 100
    }

    translate(dis: number[]): this {
        this.obj.translateX(dis[0] || 0)
        this.obj.translateY(dis[1] || 0)
        this.obj.translateZ(dis[2] || 0)
        return this
    }

    rotate(rot: number[]): this {
        this.obj.rotation.x = rot[0] || 0
        this.obj.rotation.y = rot[1] || 0
        this.obj.rotation.z = rot[2] || 0
        return this
    }
}

export default Plane