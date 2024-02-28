import { Mesh, type ColorRepresentation, MeshBasicMaterial, BoxGeometry } from "three"

class DrawBox {
    obj: Mesh;

    constructor(pos: number[], len: number[], color: ColorRepresentation = 0xeeeeee) {
        const geometry = new BoxGeometry(16 * (len[0] || 1), 16, 16 * (len[1] || 1))
        const material = new MeshBasicMaterial({ color })
        this.obj = new Mesh(geometry, material)

        this.obj.position.x = (pos[0] || 0) * 16 + 8 * (len[0] || 1)
        this.obj.position.y = (pos[1] || 0) * 16 + 8
        this.obj.position.z = (pos[2] || 0) * 16 + 8 * (len[1] || 1)
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

export default DrawBox