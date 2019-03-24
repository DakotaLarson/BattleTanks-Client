import { CircleGeometry, Geometry, Mesh, MeshLambertMaterial, Scene, Texture, TextureLoader, Vector3, Vector4 } from "three";
import SceneHandler from "./SceneHandler";

export default class SceneVisualsHandler {

    private static readonly TEAM_A_COLOR = 0xf00e30;
    private static readonly TEAM_B_COLOR = 0x0e52f0;

    private sceneHandler: SceneHandler;
    private scene: Scene;

    private teamASpawnVisuals: Mesh | undefined;
    private teamBSpawnVisuals: Mesh | undefined;

    private shieldPowerupVisuals: Mesh | undefined;
    private healthPowerupVisuals: Mesh | undefined;
    private speedPowerupVisuals: Mesh | undefined;
    private ammoPowerupVisuals: Mesh | undefined;

    private spawnTexture: Texture | undefined;
    private shieldTexture: Texture | undefined;
    private healthTexture: Texture | undefined;
    private speedTexture: Texture | undefined;
    private ammoTexture: Texture | undefined;

    constructor(sceneHandler: SceneHandler, scene: Scene) {
        this.sceneHandler = sceneHandler;
        this.scene = scene;

        const textureLoader = new TextureLoader();
        textureLoader.load(location.pathname + "res/world/arrow.png", (texture) => {
            this.spawnTexture = texture;
        });
        textureLoader.load(location.pathname + "res/world/shield.png", (texture) => {
            this.shieldTexture = texture;
        });
        textureLoader.load(location.pathname + "res/world/health.png", (texture) => {
            this.healthTexture = texture;
        });
        textureLoader.load(location.pathname + "res/world/speed.png", (texture) => {
            this.speedTexture = texture;
        });
        textureLoader.load(location.pathname + "res/world/ammo.png", (texture) => {
            this.ammoTexture = texture;
        });
    }

    public update() {
        if (this.teamASpawnVisuals) {
            this.scene.remove(this.teamASpawnVisuals);
        }
        if (this.teamBSpawnVisuals) {
            this.scene.remove(this.teamBSpawnVisuals);
        }
        if (this.shieldPowerupVisuals) {
            this.scene.remove(this.shieldPowerupVisuals);
        }
        if (this.healthPowerupVisuals) {
            this.scene.remove(this.healthPowerupVisuals);
        }
        if (this.speedPowerupVisuals) {
            this.scene.remove(this.speedPowerupVisuals);
        }
        if (this.ammoPowerupVisuals) {
            this.scene.remove(this.ammoPowerupVisuals);
        }
        const teamASpawnMesh = this.createRotatedPositionsVisualMesh(this.sceneHandler.teamASpawnPositions, SceneVisualsHandler.TEAM_A_COLOR);
        const teamBSpawnMesh = this.createRotatedPositionsVisualMesh(this.sceneHandler.teamBSpawnPositions, SceneVisualsHandler.TEAM_B_COLOR);

        const shieldPowerupMesh = this.createPositionsVisualMesh(this.sceneHandler.shieldPowerupPositions, this.shieldTexture);
        const healthPowerupMesh = this.createPositionsVisualMesh(this.sceneHandler.healthPowerupPositions, this.healthTexture);
        const speedPowerupMesh = this.createPositionsVisualMesh(this.sceneHandler.speedPowerupPositions, this.speedTexture);
        const ammoPowerupMesh = this.createPositionsVisualMesh(this.sceneHandler.ammoPowerupPositions, this.ammoTexture);

        this.scene.add(teamASpawnMesh, teamBSpawnMesh, shieldPowerupMesh, healthPowerupMesh, speedPowerupMesh, ammoPowerupMesh);

        this.teamASpawnVisuals = teamASpawnMesh;
        this.teamBSpawnVisuals = teamBSpawnMesh;
        this.shieldPowerupVisuals = shieldPowerupMesh;
        this.healthPowerupVisuals = healthPowerupMesh;
        this.speedPowerupVisuals = speedPowerupMesh;
        this.ammoPowerupVisuals = ammoPowerupMesh;
    }

    public clearVisuals() {
        if (this.teamASpawnVisuals) {
            this.scene.remove(this.teamASpawnVisuals);
            this.teamASpawnVisuals = undefined;
        }
        if (this.teamBSpawnVisuals) {
            this.scene.remove(this.teamBSpawnVisuals);
            this.teamBSpawnVisuals = undefined;
        }
        if (this.shieldPowerupVisuals) {
            this.scene.remove(this.shieldPowerupVisuals);
            this.shieldPowerupVisuals = undefined;
        }
        if (this.healthPowerupVisuals) {
            this.scene.remove(this.healthPowerupVisuals);
            this.healthPowerupVisuals = undefined;
        }
        if (this.speedPowerupVisuals) {
            this.scene.remove(this.speedPowerupVisuals);
            this.speedPowerupVisuals = undefined;
        }
        if (this.ammoPowerupVisuals) {
            this.scene.remove(this.ammoPowerupVisuals);
            this.ammoPowerupVisuals = undefined;
        }
    }

    private createRotatedPositionsVisualMesh(positions: Vector4[], color: number) {
        const masterGeo = new Geometry();

        for (const pos of positions) {
            const geo = new CircleGeometry(0.5, 16);

            geo.rotateX(-Math.PI / 2);
            geo.rotateY(pos.w);

            for (const vert of geo.vertices) {
                vert.add(new Vector3(pos.x + 0.5, pos.y + 0.01, pos.z + 0.5));
            }
            masterGeo.merge(geo);
        }

        const material = new MeshLambertMaterial({
            map: this.spawnTexture,
            color,
        });

        return new Mesh(masterGeo, material);
    }

    private createPositionsVisualMesh(positions: Vector3[], texture: Texture | undefined) {
        const masterGeo = new Geometry();

        for (const pos of positions) {
            const geo = new CircleGeometry(0.5, 16);

            geo.rotateX(-Math.PI / 2);

            for (const vert of geo.vertices) {
                vert.add(new Vector3(pos.x + 0.5, pos.y + 0.01, pos.z + 0.5));
            }
            masterGeo.merge(geo);
        }

        const material = new MeshLambertMaterial({
            map: texture,
        });

        return new Mesh(masterGeo, material);
    }
}
