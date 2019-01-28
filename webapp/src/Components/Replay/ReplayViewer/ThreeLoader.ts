import { MTLLoader, OBJLoader } from "src/lib"

import { BackSide, Group, LoadingManager, Mesh, MeshPhongMaterial } from "three"

export class ThreeModelLoader {
    public static Instance(loadingManager: LoadingManager) {
        if (!ThreeModelLoader.instance) {
            ThreeModelLoader.instance = new ThreeModelLoader(loadingManager)
        }
        return ThreeModelLoader.instance
    }

    private static instance: ThreeModelLoader

    private readonly loadingManager: LoadingManager

    private carObject: Group
    private ballObject: Group
    private fieldObject: Group

    private constructor(loadingManager: LoadingManager) {
        this.loadingManager = loadingManager
    }

    public async getCar() {
        if (!this.carObject) {
            await new Promise((resolve: () => void, reject: (error: ErrorEvent) => void) => {
                const materialLoader = new MTLLoader(this.loadingManager)
                materialLoader.load(
                    "/assets/shared/models/Octane.mtl",
                    (mtlc) => {
                        const objectLoader = new OBJLoader(this.loadingManager)
                        objectLoader.setMaterials(mtlc)
                        objectLoader.load(
                            "/assets/shared/models/Octane.obj",
                            (octane: Group) => {
                                this.carObject = octane
                                resolve()
                            },
                            undefined,
                            (error: ErrorEvent) => reject(error)
                        )
                    },
                    undefined,
                    (error: ErrorEvent) => reject(error)
                )
            })
        }
        return this.carObject.clone(true)
    }

    public async getBall() {
        if (!this.ballObject) {
            await new Promise((resolve: () => void, reject: (error: ErrorEvent) => void) => {
                const materialLoader = new MTLLoader(this.loadingManager)
                materialLoader.setPath("/assets/shared/models/")
                materialLoader.setMaterialOptions({ side: BackSide })
                materialLoader.load(
                    "Ball.mtl",
                    (mtlc) => {
                        const objectLoader = new OBJLoader(this.loadingManager)
                        objectLoader.setMaterials(mtlc)
                        objectLoader.load(
                            "/assets/shared/models/Ball.obj",
                            (ball: Group) => {
                                this.ballObject = ball
                                resolve()
                            },
                            undefined,
                            (error: ErrorEvent) => reject(error)
                        )
                    },
                    undefined,
                    (error: ErrorEvent) => reject(error)
                )
            })
        }
        return this.ballObject.clone(true)
    }

    public async getField() {
        if (!this.fieldObject) {
            await new Promise((resolve: () => void, reject: (error: ErrorEvent) => void) => {
                // const objLoader = new OBJLoader(this.loadingManager)
                // objLoader.load("/assets/shared/models/Field2.obj", (arena: Group) => {
                //     const w = window as any
                //     w.arena = arena
                //     arena.scale.setScalar(985)
                //     arena.rotation.set(0, Math.PI / 2, 0)
                //     this.threeField.scene.add(arena)
                // })

                // const materialLoader = new MTLLoader(this.loadingManager)
                // materialLoader.setMaterialOptions({ side: BackSide })
                // materialLoader.load(
                //     "/assets/shared/models/Field.mtl",
                //     (materials: any) => {
                //         const objectLoader = new OBJLoader(this.loadingManager)
                //         materials.preload()
                //         // objectLoader.setMaterials(materials)
                //         objectLoader.load(
                //             "/assets/shared/models/Field.obj",
                //             (field: Group) => {
                //                 this.fieldObject = field
                //                 resolve()
                //             },
                //             undefined,
                //             (error: ErrorEvent) => reject(error)
                //         )
                //     },
                //     undefined,
                //     (error: ErrorEvent) => reject(error)
                // )

                // const mc = new MaterialCreator()
                // mc.setMaterials(cleanMaterial)
                // mc.side = BackSide
                const objectLoader = new OBJLoader(this.loadingManager)
                // objectLoader.setMaterials(mc)
                objectLoader.load(
                    "/assets/shared/models/Field.obj",
                    (field: Group) => {
                        field.children.map((mesh: Mesh) => {
                            const cleanMaterial = new MeshPhongMaterial({ color: 0x555555 })
                            cleanMaterial.side = BackSide
                            mesh.material = cleanMaterial
                        })
                        this.fieldObject = field
                        resolve()
                    },
                    undefined,
                    (error: ErrorEvent) => reject(error)
                )
            })
        }
        return this.fieldObject.clone(true)
    }
}
