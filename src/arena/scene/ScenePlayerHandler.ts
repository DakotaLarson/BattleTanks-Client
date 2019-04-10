import { AudioBuffer, AudioListener, AudioLoader, BackSide, Font, FontLoader, FrontSide, Group, Mesh, MeshBasicMaterial, MeshLambertMaterial, PerspectiveCamera, PositionalAudio, RingBufferGeometry, Scene, ShapeBufferGeometry, SphereGeometry, Vector3, Vector4} from "three";
import ChildComponent from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";
import IPlayerObj from "../../interfaces/IPlayerObj";
import Options from "../../Options";
import BatchHandler from "./batch/BatchHandler";
import BillboardBatchHandler from "./batch/BillboardBatchHandler";
import EngineAudioHandler from "./EngineAudioHandler";
import ModelLoader from "./ModelLoader";

export default class ScenePlayerHandler extends ChildComponent {

    private static readonly HEALTH_BAR_OFFSET = new Vector3(0, 1, 0);
    private static readonly SHIELD_BAR_OFFSET = new Vector3(0, 1.1, 0);
    private static readonly NAMEPLATE_OFFSET = new Vector3(0, 1.2, 0);
    private static readonly RING_OFFSET = new Vector3(0, 0.01, 0);

    private modelLoader: ModelLoader;

    private scene: Scene;
    private camera: PerspectiveCamera;

    private ringMesh: Mesh | undefined;
    private billboardMesh: Mesh | undefined;

    private players: Map<number, IPlayerObj>;

    private audioListener: AudioListener;
    private shootAudioBuffer: AudioBuffer | undefined;
    private engineAudioHandler: EngineAudioHandler;

    private font: Font | undefined;

    private controlledPlayerId: number;

    constructor(scene: Scene, audioListener: AudioListener) {
        super();

        this.modelLoader = new ModelLoader();

        this.players = new Map();

        this.scene = scene;
        this.camera = Globals.getGlobal(Globals.Global.CAMERA);

        let extension;
        // @ts-ignore Safari is behind the times.
        if (window.webkitAudioContext) {
            extension = ".mp3";
        } else {
            extension = ".ogg";
        }

        this.audioListener = audioListener;
        const audioLoader = new AudioLoader();
        this.engineAudioHandler = new EngineAudioHandler(audioLoader, this.audioListener, this.players, extension);

        // @ts-ignore Disregard additional arguments
        audioLoader.load(location.pathname + "res/audio/effects/game/shoot" + extension, (buffer: AudioBuffer) => {
            this.shootAudioBuffer = buffer;
        });

        // @ts-ignore Disregard additional arguments
        const fontLoader = new FontLoader();
        fontLoader.load(location.pathname + "res/font/Bombardier_Regular.json", (font: Font) => {
            this.font = font;
        });

        this.controlledPlayerId = -1;

        this.createBatchedMeshes();

    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_REMOVAL, this.removePlayer);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_MOVE, this.onPlayerMove);

        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_ADDITION, this.onConnectedPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_REMOVAL, this.removePlayer);
        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.addListener(this, EventHandler.Event.PROTECTION_START, this.onProtectionStart);
        EventHandler.addListener(this, EventHandler.Event.PROTECTION_END, this.onProtectionEnd);

        EventHandler.addListener(this, EventHandler.Event.PLAYER_SHOOT, this.onShoot);
        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_SHOOT, this.onShoot);

        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_HEALTH_CHANGE, this.onHealthChange);
        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_SHIELD_CHANGE, this.onShieldChange);

        this.attachChild(this.engineAudioHandler);

        this.removeBatchedMeshes();
        this.createBatchedMeshes();
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_REMOVAL, this.removePlayer);
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_MOVE, this.onPlayerMove);

        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_ADDITION, this.onConnectedPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_REMOVAL, this.removePlayer);
        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.removeListener(this, EventHandler.Event.PROTECTION_START, this.onProtectionStart);
        EventHandler.removeListener(this, EventHandler.Event.PROTECTION_END, this.onProtectionEnd);

        EventHandler.removeListener(this, EventHandler.Event.PLAYER_SHOOT, this.onShoot);
        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_SHOOT, this.onShoot);

        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_HEALTH_CHANGE, this.onHealthChange);
        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_SHIELD_CHANGE, this.onShieldChange);

        this.detachChild(this.engineAudioHandler);
        this.removeBatchedMeshes();
    }

    public clearPlayers() {
        for (const [, player] of this.players) {
            this.removePlayer(player, true);
        }
        this.players.clear();
    }

    public addMenuPlayer() {
        setTimeout(() => {
            this.addPlayer(0, new Vector4(2.5, 0, 2.5, Math.PI / 4), "test", true, true, 0xd32282);
            this.addPlayer(0, new Vector4(1.5, 0, 4.5, Math.PI / 4), "test", true, true, 0xd32282);
        }, 500);
    }

    private onPlayerAddition(data: any) {
        this.addPlayer(data.id, data.pos, name, false, false, data.color);
    }

    private onConnectedPlayerAddition(data: any) {
        this.addPlayer(data.id, data.pos, data.name, true, false, data.color);
    }

    private onPlayerMove(data: any) {
        const playerObj = this.players.get(data.id);
        if (playerObj) {
            playerObj.group.position.copy(data.pos);
            const body = playerObj.body;
            const head = playerObj.head;
            const nameplate = playerObj.nameplate;
            const healthBar = playerObj.healthBar;
            const shieldBar = playerObj.shieldBar;

            head.rotation.y = data.headRot;

            body.rotation.y = data.bodyRot;

            const cameraPos = this.camera.position;

            if (nameplate) {
                nameplate.lookAt(cameraPos);
            }
            if (healthBar) {
                healthBar.lookAt(cameraPos);
            }
            if (shieldBar) {
                shieldBar.lookAt(cameraPos);
            }

            playerObj.movementVelocity = data.movementVelocity;
            this.engineAudioHandler.updateEngineSound(playerObj);
        }
    }

    private removePlayer(data: any, isClear?: boolean) {
        let obj;
        if (isClear) {
            obj = data;
        } else {
            obj = this.players.get(data.id);
        }
        if (obj) {
            this.scene.remove(obj.group);

            if (!isClear) {
                // Cleared after loop otherwise
                this.players.delete(data.id);
            }
            if (this.controlledPlayerId === data.id) {
                this.controlledPlayerId = -1;
            }
            this.engineAudioHandler.stopEngineSound(obj);
        }
    }

    private addPlayer(id: number, pos: Vector4, name: string, isConnectedPlayer: boolean, noSound: boolean, color?: number) {
        const group = new Group();
        const head = new Group();
        const body = new Group();
        group.position.set(pos.x, pos.y, pos.z);
        this.modelLoader.getGroup("3", true).then((result: Group) => {
            const headMesh = result.getObjectByName("head") as Mesh;
            const bodyMesh = result.getObjectByName("body") as Mesh;

            head.add(headMesh);
            body.add(bodyMesh);
        });

        body.rotation.y = pos.w;
        head.rotation.y = pos.w;

        if (color) {
            this.generateRing(color, group.position.clone().add(ScenePlayerHandler.RING_OFFSET));
        }

        group.add(head, body);
        this.scene.add(group);

        const playerObj: IPlayerObj = {
            group,
            body,
            head,
            movementVelocity: 0,
        };

        if (isConnectedPlayer) {
            const nameplate = this.generateNameplate(name, color as number);
            nameplate.position.add(ScenePlayerHandler.NAMEPLATE_OFFSET);

            this.generateHealthBar(1, group.position.clone().add(ScenePlayerHandler.HEALTH_BAR_OFFSET));

            this.generateShieldBar(0.5, group.position.clone().add(ScenePlayerHandler.SHIELD_BAR_OFFSET));

            group.add(nameplate);

            playerObj.nameplate = nameplate;
        }

        this.players.set(id, playerObj);

        if (!isConnectedPlayer) {
            this.controlledPlayerId = id;
        }

        if (!noSound) {
            this.engineAudioHandler.startEngineSound(playerObj);
        }
    }

    private onShoot(playerId?: number) {
        if (!playerId) {
            playerId = this.controlledPlayerId;
        }
        const player = this.players.get(playerId);
        this.playSound(player as IPlayerObj, this.shootAudioBuffer as AudioBuffer);
    }

    private onHealthChange() {
        // const playerObj = this.players.get(data.id);
        // if (playerObj) {
        //     let healthBar = playerObj.healthBar;
        //     if (healthBar) {
        //         playerObj.group.remove(healthBar);
        //     }

        //     healthBar = this.generateHealthBar(data.health);

        //     healthBar.position.copy(playerObj.body.position).add(ScenePlayerHandler.HEALTH_BAR_OFFSET);

        //     healthBar.lookAt(this.camera.position);

        //     playerObj.group.add(healthBar);
        //     playerObj.healthBar = healthBar;
        // }
    }

    private onShieldChange() {
        // const playerObj = this.players.get(data.id);
        // if (playerObj) {
        //     let shieldBar = playerObj.shieldBar;
        //     if (shieldBar) {
        //         playerObj.group.remove(shieldBar);
        //     }

        //     shieldBar = this.generateShieldBar(data.shield);

        //     shieldBar.position.copy(playerObj.body.position).add(ScenePlayerHandler.SHIELD_BAR_OFFSET);

        //     shieldBar.lookAt(this.camera.position);

        //     playerObj.group.add(shieldBar);
        //     playerObj.shieldBar = shieldBar;
        // }
    }

    private onProtectionStart(id: number) {

        const playerObj = this.players.get(id);
        if (playerObj) {
            const sphere = this.generateProtectionSphere();
            sphere.position.copy(playerObj.body.position);
            playerObj.group.add(sphere);
            playerObj.protectionSphere = sphere;
        }
    }

    private onProtectionEnd(id: number) {
        const playerObj = this.players.get(id);
        if (playerObj && playerObj.protectionSphere) {
            playerObj.group.remove(playerObj.protectionSphere);
            playerObj.protectionSphere = undefined;
        }
    }

    private generateNameplate(name: string, color: number) {
        if (this.font) {
            // @ts-ignore Types specification is not remotely correct.
            const shapes = this.font.generateShapes(name, 0.175);

            const geometry = new ShapeBufferGeometry(shapes);
            geometry.computeBoundingBox();
            const xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
            geometry.translate(xMid, 0, 0);

            const material = new MeshBasicMaterial({
                color,
            });

            const mesh = new Mesh(geometry, material);
            return mesh;
        } else {
            throw new Error("Font is not loaded");
        }
    }

    private generateHealthBar(health: number, pos: Vector3) {
        return this.addBar(0x00ff00, health, pos);
    }

    private generateShieldBar(shield: number, pos: Vector3) {
        return this.addBar(0x0095d8, shield, pos);
    }

    private addBar(color: number, percentage: number, position: Vector3) {
        BillboardBatchHandler.add(this.billboardMesh!, position, color, percentage);
    }

    private generateProtectionSphere() {
        // Two spheres are required to remove rendering artifacts.
        const sphereGeo = new SphereGeometry(1.25, 12, 12, 0, Math.PI);
        const sphere1Material = new MeshLambertMaterial({
            color: 0xf0f0f0,
            transparent: true,
            side: BackSide,
        });
        const sphere2Material = new MeshLambertMaterial({
            color: 0xf0f0f0,
            transparent: true,
            side: FrontSide,
        });
        sphere1Material.opacity = 0.5;
        sphere2Material.opacity = 0.5;
        const sphere1Obj = new Mesh(sphereGeo, sphere1Material);
        const sphere2Obj = new Mesh(sphereGeo, sphere2Material);
        sphere1Obj.rotateX(-Math.PI / 2);
        sphere2Obj.rotateX(-Math.PI / 2);

        const group = new Group();
        group.add(sphere1Obj, sphere2Obj);
        return group;
    }

    private generateRing(color: number, pos: Vector3) {
        BatchHandler.add(this.ringMesh!, pos, color);
    }

    private playSound(player: IPlayerObj, buffer: AudioBuffer) {

        const volume = Options.options.effectsVolume;
        const enabled = Globals.getGlobal(Globals.Global.AUDIO_ENABLED);
        if (enabled && volume) {

            const audio = new PositionalAudio(this.audioListener);
            audio.setVolume(volume);
            player.head.add(audio);

            audio.onEnded = () => {
                audio.isPlaying = false;
                player.head.remove(audio);
            };

            audio.setBuffer(buffer);
            audio.play();
        }
    }

    private createBatchedMeshes() {
        const ringGeo = new RingBufferGeometry(0.85, 1, 64);
        ringGeo.rotateX(-Math.PI / 2);

        this.billboardMesh = BillboardBatchHandler.create([], [], []);
        this.ringMesh = BatchHandler.create(ringGeo, [], []);
        this.scene.add(this.billboardMesh, this.ringMesh);
    }

    private removeBatchedMeshes() {
        this.scene.remove(this.ringMesh!, this.billboardMesh!);
    }
}
