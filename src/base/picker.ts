import { Object3D, type Object3DEventMap, Raycaster, type Scene, type Vector2, type OrthographicCamera, type PerspectiveCamera, Vector3 } from "three"

class Picker {
    raycaster: Raycaster;
    pickedObject: any = undefined;
    pickedObjectSavedColor = 0;
    pickedObjectPoint: Vector3 | undefined = undefined;
    constructor() {
        this.raycaster = new Raycaster()
    }
    pick(normalizedPosition: Vector2, scene: Scene, camera: OrthographicCamera | PerspectiveCamera) {
        if (this.pickedObject) {
            //this.pickedObject.material.color.setHex(this.pickedObjectSavedColor)
            this.pickedObject = undefined
        }

        this.raycaster.setFromCamera(normalizedPosition, camera)
        const intersectedObjects = this.raycaster.intersectObjects(scene.children)
        if (intersectedObjects.length) {
            this.pickedObject = intersectedObjects[0].object
            this.pickedObjectPoint = intersectedObjects[0].point
            //this.pickedObjectSavedColor = this.pickedObject.material.color.getHex()
            //this.pickedObject.material.color.setHex(Number(this.pickedObjectSavedColor / 2 + 0xffffff / 2))
        }
    }
}

export default Picker