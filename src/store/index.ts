import { defineStore } from "pinia"
import PonderGuyDB from "@/base/db"
import axios from "axios"

export const useStore = defineStore('ponderGuy', {
    state: () => {
        return {
            db: new PonderGuyDB()
        }
    },
    actions: {
        async getPonder() {
            let data = (await this.db.models.get("ponder"))?.model
            if (!data) {
                const res = await axios.get("/ponder-processed.glb", {
                    responseType: "arraybuffer"
                })
                data = res.data as ArrayBuffer
                await this.db.models.put({
                    id: "ponder",
                    name: "Ponder小子",
                    model: data
                })
            }
            return data
        }
    }
})