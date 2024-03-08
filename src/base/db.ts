import Dexie from "dexie"

interface IModel {
    id: string;
    name: string;
    model: ArrayBuffer;
}

export default class PonderGuyDB extends Dexie {
    models!: Dexie.Table<IModel, string>;

    constructor() {
        super("ponderguy")

        this.version(3).stores({
            models: "id, name, model"
        })
    }
}