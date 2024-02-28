import Component from "@/base/component"
import { MeshStandardMaterial, PlaneGeometry, WebGLRenderTarget, Mesh, MeshBasicMaterial, OrthographicCamera, DoubleSide, Color, AmbientLight, DirectionalLight, Matrix4, Vector3, ShaderMaterial } from "three"
import Cube from "./cube";

class Mirror extends Component {
    sizes: { width: number, height: number };
    virtualCamera: OrthographicCamera;
    renderTarget: WebGLRenderTarget;
    constructor(...args: any) {
        super(...args)
        const width = window.innerWidth
        this.sizes = {
            width,
            height: width * 2,
        }
        const tm = 32
        this.virtualCamera = new OrthographicCamera(
            this.sizes.width / -tm,
            this.sizes.width / tm,
            this.sizes.height / tm,
            this.sizes.height / -tm,
            -200,
            500
        )
        this.renderTarget = new WebGLRenderTarget(this.sizes.width, this.sizes.height)
        this.virtualCamera.position.set(200, 200, -200)

        this.generateMirror(args[0])
    }
    generateElement(...args: any) {
    }
    generateMirror(pos: number[]) {
        const geometry = new PlaneGeometry(80, 160)
        //console.log(geometry)
        const planeMaterial = new MeshBasicMaterial({ map: this.renderTarget.texture })
        /*const planeMaterial = new ShaderMaterial({
            uniforms: {
                uTexture: { value: this.renderTarget.texture },
                uMatrix: { value: new Matrix4().makeScale(1, 1, 1) }
            },
            vertexShader: `
                uniform mat4 uMatrix;

                varying vec2 vUv;

                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * uMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D uTexture;

                varying vec2 vUv;

                void main() {
                    gl_FragColor = texture2D(uTexture, vUv);
                }
            `
        })*/
        //const planeMaterial = new MeshBasicMaterial({ color: 0xeeeeee })
        const reflector = new Mesh(geometry, planeMaterial)

        reflector.position.x = 0
        reflector.position.y = 0
        reflector.position.z = 0

        reflector.applyMatrix4(new Matrix4().makeScale(-1, 1, 1))

        reflector.onBeforeRender = (renderer, scene, camera) => {
            //console.log(camera.position)

            reflector.visible = false
            this.virtualCamera.lookAt(scene.position)
            const currentRenderTarget = renderer.getRenderTarget()

            renderer.setRenderTarget(this.renderTarget)
            renderer.render(scene, this.virtualCamera)

            reflector.visible = true
            renderer.setRenderTarget(currentRenderTarget)
        }
        this.add(reflector)
    }
}
export default Mirror