import {
    Camera,
    Group,
    LinearMipMapLinearFilter,
    Mesh,
    MeshPhongMaterial,
    NearestFilter,
    Sprite,
    SpriteMaterial,
    Texture,
    Vector3
} from "three"
import { CAR_SUFFIX } from "./ThreeHelper"

const CAMERA_ABOVE_PLAYER = 200

export class ThreePlayer {
    public carObject: Group

    private camera: Camera | null
    private nameTag: Sprite
    private readonly playerName: string
    private readonly orangeTeam: boolean

    constructor(playerName: string, orangeTeam: boolean) {
        this.playerName = playerName
        this.orangeTeam = orangeTeam
    }

    public getName() {
        return this.playerName
    }

    public init(carObject: Group) {
        this.setMaterial(carObject)

        const player = new Group()
        player.name = this.playerName
        player.add(carObject)

        // Add nametag
        this.generateSprite()
        this.nameTag.scale.setScalar(600)
        player.add(this.nameTag)

        this.carObject = player
    }

    public makeActive(camera: Camera) {
        this.carObject.add(camera)
        this.camera = camera
        camera.position.set(0, CAMERA_ABOVE_PLAYER, 0)
        this.nameTag.visible = false
    }

    public updateCamera(ballPosition: Vector3, isUsingBoost: boolean) {
        const vectorToBall = new Vector3()
        const scaleFromPlayer = 300
        vectorToBall.subVectors(this.carObject.position, ballPosition)
        vectorToBall.setLength(scaleFromPlayer)
        vectorToBall.y += CAMERA_ABOVE_PLAYER
        if (vectorToBall.y < 0) {
            const lowYFactor = 15
            vectorToBall.setLength(lowYFactor / -vectorToBall.y + (scaleFromPlayer - lowYFactor))
            vectorToBall.y = 0
        }
        const camera = this.camera as any
        // TODO: Tween FOV
        // if (isUsingBoost && camera.fov === 80) {
        //     camera.fov = 85
        //     camera.updateProjectionMatrix()
        // } else if (camera.fov === 85) {
        //     camera.fov = 80
        //     camera.updateProjectionMatrix()
        // }
        camera.position.copy(vectorToBall)
    }

    public makeUnactive() {
        this.nameTag.visible = true
        if (this.camera) {
            this.carObject.remove(this.camera)
        }
        this.camera = null
    }

    private setMaterial(playerMesh: Group) {
        playerMesh.name = `${this.playerName}${CAR_SUFFIX}`
        // Grab the existing car mesh
        const mesh = playerMesh.children[0] as Mesh
        // Clone all materials
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        mesh.material = materials.map((material) => material.clone())
        mesh.name = `${this.playerName}-main-mesh`
        // The top half of the car
        const body = mesh.material[0] as MeshPhongMaterial
        body.name = `${this.playerName}-body`
        // 0xff9800 is orange, 0x2196f3 is blue
        const carColor = this.orangeTeam ? 0xff9800 : 0x2196f3
        body.color.setHex(carColor)
    }

    private generateSprite() {
        const name = this.playerName.toUpperCase()

        const border = 10
        const fontSize = 60
        const canvasSize = 480
        const canvas = document.createElement("canvas")
        canvas.width = 512
        canvas.height = canvas.width
        const context = canvas.getContext("2d")

        // Rectangle prototyping
        const roundRect = (
            ct: CanvasRenderingContext2D,
            x: number,
            y: number,
            w: number,
            h: number,
            radius: number
        ) => {
            if (w > h) {
                radius = h / 2
            } else {
                radius = w / 2
            }
            ct.beginPath()
            ct.moveTo(x + radius, y)
            ct.arcTo(x + w, y, x + w, y + h, radius)
            ct.arcTo(x + w, y + h, x, y + h, radius)
            ct.arcTo(x, y + h, x, y, radius)
            ct.arcTo(x, y, x + w, y, radius)
            ct.closePath()
            return ct
        }

        if (context) {
            context.font = `bold ${fontSize}px Arial`
            context.fillStyle = this.orangeTeam ? "#ff9800" : "#2196f3"
            roundRect(
                context,
                border,
                border,
                canvasSize,
                fontSize + border * 2,
                fontSize * 2
            ).fill()
            context.strokeStyle = "#eee"
            context.lineWidth = border
            roundRect(
                context,
                border,
                border,
                canvasSize,
                fontSize + border * 2,
                fontSize * 2
            ).stroke()
            context.fillStyle = "#fff"
            const measure = context.measureText(name)
            const padding = border / 2 + fontSize / 2
            const maxWidth = canvasSize - padding * 2
            const width = maxWidth > measure.width ? measure.width : maxWidth
            const x = canvasSize / 2 + border / 2 - width / 2
            context.fillText(name, x, fontSize + border, maxWidth)
        }

        const texture = new Texture(canvas)
        texture.needsUpdate = true
        texture.magFilter = NearestFilter
        texture.minFilter = LinearMipMapLinearFilter
        const spriteMaterial = new SpriteMaterial({
            map: texture
        })
        const sprite = new Sprite(spriteMaterial)
        this.nameTag = sprite
    }
}
