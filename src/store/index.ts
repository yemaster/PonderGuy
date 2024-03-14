import { toRaw } from 'vue'
import { defineStore } from "pinia"
import PonderGuyDB from "@/base/db"
import axios from '@/base/axios'
import { Clock, AnimationAction, AnimationClip, AnimationMixer } from "three"
import { GLTFLoader, type GLTF } from "three/examples/jsm/Addons.js"
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js"

async function asyncLoader(data: string | ArrayBuffer, path: string): Promise<GLTF> {
    return new Promise((resolve, rejects) => {
        const loader = new GLTFLoader()
        loader.setMeshoptDecoder(MeshoptDecoder)
        loader.parse(data, path, (gltf) => {
            resolve(gltf)
        }, (err) => {
            rejects(err)
        })
    })
}

export const useStore = defineStore('ponderGuy', {
    state: () => {
        return {
            db: new PonderGuyDB(),
            model: undefined as GLTF | undefined,
            animation: undefined as { mixer: AnimationMixer, animations: { [key: string]: AnimationAction } } | undefined,
            clock: undefined as Clock | undefined
        }
    },
    actions: {
        async getPonderModel() {
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
            if (!this.model) {
                this.model = await asyncLoader(data, "/")
                this.setupAnimation()
            }
            if (!this.animation) {
                this.setupAnimation()
            }
            return this.model
        },
        setupAnimation() {
            if (!this.model)
                return
            const model = toRaw(this.model)
            const mixer = new AnimationMixer(model.scene)
            this.clock = new Clock()
            this.animation = {
                mixer,
                animations: {
                    Sitting: mixer.clipAction(AnimationClip.findByName(model.animations, "Sitting")),
                    Running: mixer.clipAction(AnimationClip.findByName(model.animations, "Running")),
                    Standing: mixer.clipAction(AnimationClip.findByName(model.animations, "Standing")),
                }
            }
            this.animation.animations.Sitting.play()
            this.animation.animations.Running.play()
            this.animation.animations.Standing.play()
            this.animation.animations.Sitting.weight = 0
            this.animation.animations.Running.weight = 0
            this.animation.animations.Standing.weight = 1
        },
        setAnimation(t: "Sitting" | "Running" | "Standing") {
            if (!this.animation)
                return
            this.animation.animations.Sitting.weight = 0
            this.animation.animations.Running.weight = 0
            this.animation.animations.Standing.weight = 0
            this.animation.animations[t].weight = 1
        },
        updateAnimation() {
            if (!this.animation || !this.clock)
                return
            this.animation.mixer.update(this.clock.getDelta())
        }
    }
})