import { BoxBufferGeometry, Mesh, Quaternion, Scene, Texture, TextureLoader, Vector3 } from "three";
import ChildComponent from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import Powerup from "../powerup/Powerup";
import BatchHandler from "./batch/BatchHandler";

export default class ScenePowerupHandler extends ChildComponent {

    private scene: Scene;
    private powerups: any[][];
    private meshes: Mesh[];
    private textures: Texture[];

    constructor(scene: Scene) {
        super();
        this.scene = scene;
        this.powerups = [];

        this.meshes = [];
        this.textures = [];

        const textureNames = [
            "shield",
            "health",
            "speed",
            "ammo",
        ];

        const textureLoader = new TextureLoader();
        const geo = new BoxBufferGeometry(Powerup.SIZE, Powerup.SIZE, Powerup.SIZE);
        for (let i = 0; i < textureNames.length; i ++) {
            textureLoader.load(location.pathname + "res/world/" + textureNames[i] + ".png", (texture) => {
                this.textures[i] = texture;
                this.meshes[i] = BatchHandler.create(geo, [], [], [], texture);
                this.powerups[i] = [];
            });
        }
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.POWERUP_ADDITION, this.onPowerupAddition);
        EventHandler.addListener(this, EventHandler.Event.POWERUP_REMOVAL, this.onPowerupRemoval);
        EventHandler.addListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onAnimationUpdate);

        this.scene.add.apply(this.scene, this.meshes);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.POWERUP_ADDITION, this.onPowerupAddition);
        EventHandler.removeListener(this, EventHandler.Event.POWERUP_REMOVAL, this.onPowerupRemoval);
        EventHandler.removeListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onAnimationUpdate);

        this.scene.remove.apply(this.scene, this.meshes);
        this.powerups = [];

    }

    public clearPowerups() {
        this.scene.remove.apply(this.scene, this.meshes);

        this.powerups = [];
        this.meshes = [];

        const geo = new BoxBufferGeometry(Powerup.SIZE, Powerup.SIZE, Powerup.SIZE);
        for (const texture of this.textures) {
            this.meshes.push(BatchHandler.create(geo, [], [], [], texture));
            this.powerups.push([]);
        }
        this.scene.add.apply(this.scene, this.meshes);
    }

    private onPowerupAddition(powerup: Powerup) {
        BatchHandler.add(this.meshes[powerup.type], powerup.position, 0x000000, powerup.rotation);
        this.powerups[powerup.type].push(powerup);
    }

    private onPowerupRemoval(powerup: Powerup) {
        const index = this.powerups[powerup.type].findIndex((existing) => {
            return existing.equals(powerup);
        });
        if (index > -1) {
            BatchHandler.remove(this.meshes[powerup.type], index);
            this.powerups[powerup.type].splice(index, 1);
        }
    }
    private onAnimationUpdate(delta: number) {
        for (let i = 0; i < this.powerups.length; i ++) {
            const type = this.powerups[i];

            const positions: Vector3[] = [];
            const rotations: Quaternion[] = [];
            const indices = [];

            for (let j = 0; j < type.length; j ++) {
                const powerup: Powerup = type[j];
                powerup.update(delta);

                positions.push(powerup.position);
                rotations.push(powerup.rotation);
                indices.push(j);
            }

            BatchHandler.updatePositions(this.meshes[i], indices, positions);
            BatchHandler.updateRotations(this.meshes[i], indices, rotations);
        }
    }
}
