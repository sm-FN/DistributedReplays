import { MTLLoader, OBJLoader } from "src/lib"

import { BackSide, Group, LoadingManager } from "three"

export class ThreeModelLoader {
    public static Instance(loadingManager: LoadingManager) {
        if (!ThreeModelLoader.instance) {
            ThreeModelLoader.instance = new ThreeModelLoader(loadingManager)
        }
        return ThreeModelLoader.instance
    }

    private static instance: ThreeModelLoader

    private loadingManager: LoadingManager

    private carObject: Group
    private ballObject: Group

    private constructor(loadingManager: LoadingManager) {
        this.loadingManager = loadingManager
    }

    public async getCar() {
        if (!this.carObject) {
            await new Promise((resolve: () => void, reject: any) => {
                const materialLoader = new MTLLoader(this.loadingManager)
                materialLoader.load("/assets/shared/models/Octane.mtl", (mtlc) => {
                    const objectLoader = new OBJLoader(this.loadingManager)
                    objectLoader.setMaterials(mtlc)
                    objectLoader.load("/assets/shared/models/Octane.obj", (octane: Group) => {
                        this.carObject = octane
                        resolve()
                    })
                })
            })
        }
        return this.carObject.clone(true)
    }

    public async getBall() {
        if (!this.ballObject) {
            await new Promise((resolve: () => void, reject: any) => {
                const materialLoader = new MTLLoader(this.loadingManager)
                materialLoader.setPath("/assets/shared/models/")
                materialLoader.setMaterialOptions({ side: BackSide })
                materialLoader.load("Ball.mtl", (mtlc) => {
                    const objectLoader = new OBJLoader(this.loadingManager)
                    objectLoader.setMaterials(mtlc)
                    objectLoader.load("/assets/shared/models/Ball.obj", (ball: Group) => {
                        this.ballObject = ball
                        resolve()
                    })
                })
            })
        }
        return this.ballObject.clone(true)
    }
}
