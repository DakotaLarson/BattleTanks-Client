import { BoxGeometry, Mesh, MeshLambertMaterial, Scene, Texture, TextureLoader, Vector3 } from "three";
import ChildComponent from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import Powerup from "../powerup/Powerup";

export default class ScenePowerupHandler extends ChildComponent {

    private static rotationSpeed = 1.75;
    private static heightSpeed = 0.05;
    private static maxHeight = 0.65;
    private static minHeight = 0.25;

    private scene: Scene;
    private powerups: any[];

    private shieldTexture: Texture | undefined;
    private healthTexture: Texture | undefined;
    private speedTexture: Texture | undefined;
    private ammoTexture: Texture | undefined;

    constructor(scene: Scene) {
        super();
        this.scene = scene;
        const textureLoader = new TextureLoader();
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
        this.powerups = [];
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.POWERUP_ADDITION, this.onPowerupAddition);
        EventHandler.addListener(this, EventHandler.Event.POWERUP_REMOVAL, this.onPowerupRemoval);
        EventHandler.addListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onAnimationUpdate);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.POWERUP_ADDITION, this.onPowerupAddition);
        EventHandler.removeListener(this, EventHandler.Event.POWERUP_REMOVAL, this.onPowerupRemoval);
        EventHandler.removeListener(this, EventHandler.Event.GAME_ANIMATION_UPDATE, this.onAnimationUpdate);

    }

    public clearPowerups() {
        for (const powerup of this.powerups) {
            this.scene.remove(powerup.mesh);
        }
        this.powerups = [];
    }

    private onPowerupAddition(powerup: Powerup) {
        const mesh = this.createPowerupMesh(powerup.type, powerup.position);
        const data = {
            type: powerup.type,
            position: powerup.position,
            rising: false,
            mesh,
        };
        this.scene.add(mesh);
        this.powerups.push(data);
    }

    private onPowerupRemoval(powerup: Powerup) {
        let index = -1;
        for (let i = 0; i < this.powerups.length; i ++) {
            const data = this.powerups[i];
            if (data.type === powerup.type && data.position.equals(powerup.position)) {
                this.scene.remove(data.mesh);
                index = i;
                break;
            }
        }
        if (index > -1) {
            this.powerups.splice(index, 1);
        }
    }

    private createPowerupMesh(type: number, position: Vector3) {
        let texture;
        if (type === 0) {
            texture = this.shieldTexture;
        } else if (type === 1) {
            texture = this.healthTexture;
        } else if (type === 2) {
            texture = this.speedTexture;
        } else if (type === 3) {
            texture = this.ammoTexture;
        } else {
            throw new Error("Unknown type: " + type);
        }
        const geo = new BoxGeometry(Powerup.size, Powerup.size, Powerup.size);
        const material = new MeshLambertMaterial({
            map: texture as Texture,
        });
        const mesh = new Mesh(geo, material);
        const y = Math.random() * ScenePowerupHandler.maxHeight - ScenePowerupHandler.minHeight;
        mesh.position.copy(position).setY(y);
        return mesh;
    }

    private onAnimationUpdate(delta: number) {
        for (const powerup of this.powerups) {
            let heightTravel = delta * ScenePowerupHandler.heightSpeed;
            let height = powerup.mesh.position.y;
            if (!powerup.rising) {
                heightTravel *= -1;
            }

            height = Math.min(ScenePowerupHandler.maxHeight, Math.max(ScenePowerupHandler.minHeight, height + heightTravel));
            if (height === ScenePowerupHandler.maxHeight || height === ScenePowerupHandler.minHeight) {
                powerup.rising = !powerup.rising;
            }

            const rotationTravel = delta * ScenePowerupHandler.rotationSpeed;
            powerup.mesh.position.y = height;
            powerup.mesh.rotation.y += rotationTravel;

        }
    }
}
