import { AudioBuffer, AudioListener, AudioLoader, BackSide, Color, Font, FontLoader, FrontSide, Group, Material, Mesh, MeshBasicMaterial, PerspectiveCamera, PositionalAudio, Quaternion, RingBufferGeometry, Scene, ShapeBufferGeometry, SphereBufferGeometry, Vector3, Vector4} from "three";
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

    private static readonly MENU_PLAYER_ID = 0;

    private modelLoader: ModelLoader;

    private scene: Scene;
    private camera: PerspectiveCamera;

    private ringMesh: Mesh | undefined;
    private billboardMesh: Mesh | undefined;

    private protectionFrontsideMesh: Mesh | undefined;
    private protectionBacksideMesh: Mesh | undefined;

    private players: IPlayerObj[];
    private billboardOwners: any[];
    private sphereOwners: number[];

    private audioListener: AudioListener;
    private shootAudioBuffer: AudioBuffer | undefined;
    private engineAudioHandler: EngineAudioHandler;

    private font: Font | undefined;

    private controlledPlayerId: number;

    constructor(scene: Scene, audioListener: AudioListener) {
        super();

        this.modelLoader = new ModelLoader();

        this.players = [];
        this.billboardOwners = [];
        this.sphereOwners = [];

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

        EventHandler.addListener(this, EventHandler.Event.PROTECTION_START, this.addProtectionSphere);
        EventHandler.addListener(this, EventHandler.Event.PROTECTION_END, this.removeProtectionSphere);

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

        EventHandler.removeListener(this, EventHandler.Event.PROTECTION_START, this.addProtectionSphere);
        EventHandler.removeListener(this, EventHandler.Event.PROTECTION_END, this.removeProtectionSphere);

        EventHandler.removeListener(this, EventHandler.Event.PLAYER_SHOOT, this.onShoot);
        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_SHOOT, this.onShoot);

        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_HEALTH_CHANGE, this.onHealthChange);
        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_SHIELD_CHANGE, this.onShieldChange);

        this.detachChild(this.engineAudioHandler);
        this.removeBatchedMeshes();
    }

    public clearPlayers() {
        for (const player of this.players) {
            this.removePlayer(player, true);
        }

        this.removeBatchedMeshes();
        this.createBatchedMeshes();

        this.players = [];
    }

    public addMenuPlayer() {
        this.addPlayer(ScenePlayerHandler.MENU_PLAYER_ID, "0", new Vector4(2.5, 0, 2.5, Math.PI / 4), "", false, true);
    }

    public async updateMenuPlayer(id: string, colors: string[]) {
        this.removePlayer({
            id: 0,
        }, false);
        const playerObj = await this.addPlayer(ScenePlayerHandler.MENU_PLAYER_ID, id, new Vector4(2.5, 0, 2.5, Math.PI / 4), "", false, true);

        for (let i = 0; i < colors.length; i ++) {
            this.updateGroupColor(playerObj.group, "" + i, colors[i]);
        }
    }

    public updateMenuPlayerColor(detail: string, materialTitle: string) {
        const group = this.players.find((player) => {
            return player.id === ScenePlayerHandler.MENU_PLAYER_ID;
        })!.group;
        this.updateGroupColor(group, materialTitle, detail);
    }

    private onPlayerAddition(data: any) {
        this.addPlayer(data.id, "0", data.pos, name, false, false, data.color);
    }

    private onConnectedPlayerAddition(data: any) {
        this.addPlayer(data.id, "0", data.pos, data.name, true, false, data.color);
    }

    private updateGroupColor(group: Group, materialTitle: string, detail: string) {
        const color = new Color("#" + detail);
        for (const child of group.children) {
            if (child instanceof Group) {
                this.updateGroupColor(child, materialTitle, detail);
            } else if (child instanceof Mesh) {
                if (Array.isArray(child.material)) {
                    for (const material of child.material) {
                        this.updateMaterial(materialTitle, material, color);
                    }
                } else {
                    this.updateMaterial(materialTitle, child.material, color);
                }
            }
        }
    }

    private updateMaterial(materialTitle: string, material: Material, color: Color) {
        if (material.name.startsWith(materialTitle)) {
            (material as any).color.copy(color);
        }
    }

    private addPlayer(id: number, modelId: string, pos: Vector4, name: string, isConnectedPlayer: boolean, noSound: boolean, teamColor?: number): Promise<IPlayerObj> {
        return new Promise((resolve) => {
            const group = new Group();
            const head = new Group();
            const body = new Group();
            group.position.set(pos.x, pos.y, pos.z);

            body.rotation.y = pos.w;
            head.rotation.y = pos.w;

            if (teamColor) {
                this.generateRing(teamColor, group.position.clone().add(ScenePlayerHandler.RING_OFFSET), new Quaternion());
            }

            group.add(head, body);
            this.scene.add(group);

            const playerObj: IPlayerObj = {
                id,
                group,
                body,
                head,
                movementVelocity: 0,
            };

            if (isConnectedPlayer) {
                const nameplate = this.generateNameplate(name, teamColor as number);
                nameplate.position.add(ScenePlayerHandler.NAMEPLATE_OFFSET);

                this.generateHealthBar(1, group.position.clone().add(ScenePlayerHandler.HEALTH_BAR_OFFSET));
                this.billboardOwners.push({
                    id,
                    isHealth: true,
                });

                this.generateShieldBar(0, group.position.clone().add(ScenePlayerHandler.SHIELD_BAR_OFFSET));
                this.billboardOwners.push({
                    id,
                    isHealth: false,
                });

                group.add(nameplate);
                playerObj.nameplate = nameplate;
            }

            this.players.push(playerObj);

            if (!isConnectedPlayer) {
                this.controlledPlayerId = id;
            }

            if (!noSound) {
                this.engineAudioHandler.startEngineSound(playerObj);
            }

            this.modelLoader.getGroup(modelId).then((result: Group) => {
                const headMesh = result.getObjectByName("head") as Mesh;
                const bodyMesh = result.getObjectByName("body") as Mesh;

                head.add(headMesh);
                body.add(bodyMesh);

                resolve(playerObj);
            });
        });
    }

    private removePlayer(data: any, isClear?: boolean) {
        let obj;
        let index;
        if (isClear) {
            obj = data;
        } else {
            index = this.players.findIndex((player) => {
                return player.id === data.id;
            });
            if (index > -1) {
                obj = this.players[index];
            }
        }
        if (obj) {
            this.scene.remove(obj.group);
            if (!isClear && index !== undefined && index > -1) {
                // Cleared after loop otherwise
                const healthIndex = this.billboardOwners.findIndex((owner) => {
                    return owner.id === data.id && owner.isHealth;
                });
                if (healthIndex > -1) {
                    BillboardBatchHandler.remove(this.billboardMesh!, healthIndex);
                    this.billboardOwners.splice(healthIndex, 1);
                }

                const shieldIndex = this.billboardOwners.findIndex((owner) => {
                    return owner.id === data.id && !owner.isHealth;
                });
                if (shieldIndex > -1) {
                    BillboardBatchHandler.remove(this.billboardMesh!, shieldIndex);
                    this.billboardOwners.splice(shieldIndex, 1);
                }

                BatchHandler.remove(this.ringMesh!, index);
                this.players.splice(index, 1);

                this.removeProtectionSphere(data.id);
            }

            if (this.controlledPlayerId === data.id) {
                this.controlledPlayerId = -1;
            }
            this.engineAudioHandler.stopEngineSound(obj);
        }
    }

    private onPlayerMove(data: any) {
        const index = this.players.findIndex((player: IPlayerObj) => {
            return player.id === data.id;
        });
        if (index > -1) {
            const playerObj = this.players[index];
            playerObj.group.position.copy(data.pos);
            const body = playerObj.body;
            const head = playerObj.head;
            const nameplate = playerObj.nameplate;

            head.rotation.y = data.headRot;

            body.rotation.y = data.bodyRot;

            const cameraPos = this.camera.position;

            BatchHandler.updatePositions(this.ringMesh!, [index], [data.pos.clone().add(ScenePlayerHandler.RING_OFFSET)]);

            this.moveProtectionSphere(data.id, data.pos);

            if (nameplate) {
                nameplate.lookAt(cameraPos);

                // Billboards are only present on connected players (those with nameplates)
                const billboardIndices = [];
                const billboardPositions = [];

                const healthBarIndex = this.billboardOwners.findIndex((owner) => {
                    return owner.id === data.id && owner.isHealth;
                });
                if (healthBarIndex > -1) {
                    billboardPositions.push(data.pos.clone().add(ScenePlayerHandler.HEALTH_BAR_OFFSET));
                    billboardIndices.push(healthBarIndex);
                }

                const shieldBarIndex = this.billboardOwners.findIndex((owner) => {
                    return owner.id === data.id && !owner.isHealth;
                });
                if (shieldBarIndex > -1) {
                    billboardPositions.push(data.pos.clone().add(ScenePlayerHandler.SHIELD_BAR_OFFSET));
                    billboardIndices.push(shieldBarIndex);
                }

                BillboardBatchHandler.updatePositions(this.billboardMesh!, billboardIndices, billboardPositions);
            }

            playerObj.movementVelocity = data.movementVelocity;
            this.engineAudioHandler.updateEngineSound(playerObj);
        }
    }

    private onShoot(playerId?: number) {
        if (!playerId) {
            playerId = this.controlledPlayerId;
        }
        const player = this.players.find((otherPlayer) => {
            return otherPlayer.id === playerId;
        });
        if (player) {
            this.playSound(player, this.shootAudioBuffer as AudioBuffer);
        }
    }

    private onHealthChange(data: any) {
        const index = this.billboardOwners.findIndex((owner) => {
            return owner.id === data.id && owner.isHealth;
        });
        if (index > -1) {
            BillboardBatchHandler.updatePercentage(this.billboardMesh!, index, data.health);
        }
    }

    private onShieldChange(data: any) {
        const index = this.billboardOwners.findIndex((owner) => {
            return owner.id === data.id && !owner.isHealth;
        });
        if (index > -1) {
            BillboardBatchHandler.updatePercentage(this.billboardMesh!, index, data.shield);
        }
    }

    private addProtectionSphere(id: number) {
        const playerObj = this.players.find((player) => {
            return player.id === id;
        });

        if (playerObj) {
            this.generateProtectionSphere(playerObj.body.position);
            this.sphereOwners.push(id);
        }
    }

    private removeProtectionSphere(id: number) {
        const index = this.sphereOwners.indexOf(id);
        if (index > -1) {
            BatchHandler.remove(this.protectionFrontsideMesh!, index);
            BatchHandler.remove(this.protectionBacksideMesh!, index);
            this.sphereOwners.splice(index, 1);
        }
    }

    private moveProtectionSphere(id: number, pos: Vector3) {
        const index = this.sphereOwners.indexOf(id);
        if (index > -1) {
            BatchHandler.updatePositions(this.protectionFrontsideMesh!, [index], [pos]);
            BatchHandler.updatePositions(this.protectionBacksideMesh!, [index], [pos]);
        }
    }

    private generateNameplate(name: string, color: number) {
        if (this.font) {
            // @ts-ignore Types specification is not remotely correct.
            const shapes = this.font.generateShapes(name, 0.1);

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

    private generateProtectionSphere(pos: Vector3) {
        BatchHandler.add(this.protectionFrontsideMesh!, pos, 0xf0f0f0, new Quaternion());
        BatchHandler.add(this.protectionBacksideMesh!, pos, 0xf0f0f0, new Quaternion());
    }

    private generateRing(color: number, pos: Vector3, orientation: Quaternion) {
        BatchHandler.add(this.ringMesh!, pos, color, orientation);
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

        const sphereGeo = new SphereBufferGeometry(1.25, 12, 12, 0, Math.PI);
        sphereGeo.rotateX(-Math.PI / 2);

        this.ringMesh = BatchHandler.create(ringGeo, [], [], []);
        this.protectionFrontsideMesh = BatchHandler.create(sphereGeo, [], [], [], undefined, FrontSide, 0.5);
        this.protectionBacksideMesh = BatchHandler.create(sphereGeo, [], [], [], undefined, BackSide, 0.5);
        this.protectionFrontsideMesh.renderOrder = 1;

        this.billboardMesh = BillboardBatchHandler.create([], [], []);
        this.scene.add(this.billboardMesh, this.ringMesh, this.protectionBacksideMesh, this.protectionFrontsideMesh);
    }

    private removeBatchedMeshes() {
        this.scene.remove(this.ringMesh!, this.billboardMesh!, this.protectionFrontsideMesh!, this.protectionBacksideMesh!);
        this.billboardOwners = [];
        this.sphereOwners = [];
    }
}
