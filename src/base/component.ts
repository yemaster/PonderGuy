import { Group } from "three"
import { v4 } from "uuid"

export default abstract class Component extends Group {
    key: string;
    movable: boolean = false;
    mirrorComponent: any;
    constructor(...args: any) {
        super()
        this.key = v4()

        this.generateElement(...args)
        this.mirrorComponent = null
    }
    setName(name: string): this {
        this.name = name
        return this
    }
    abstract generateElement(...args: any): void;
}