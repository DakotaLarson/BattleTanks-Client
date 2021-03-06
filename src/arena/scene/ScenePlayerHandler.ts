import { AudioBuffer, AudioListener, AudioLoader, BackSide, Font, FontLoader, FrontSide, Group, Material, Mesh, MeshBasicMaterial, PerspectiveCamera, PositionalAudio, Quaternion, RingBufferGeometry, Scene, ShapeBufferGeometry, SphereBufferGeometry, Vector3, Vector4} from "three";
import ChildComponent from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";
import IPlayerObj from "../../interfaces/IPlayerObj";
import Options from "../../Options";
import RankCalculator from "../../RankCalculator";
import BatchHandler from "./batch/BatchHandler";
import BillboardBatchHandler from "./batch/BillboardBatchHandler";
import EngineAudioHandler from "./EngineAudioHandler";
import MaterialHandler from "./MaterialHandler";
import ModelLoader from "./ModelLoader";
import TankCustomizationHandler from "./TankCustomizationHandler";

export default class ScenePlayerHandler extends ChildComponent {

    private static readonly HEALTH_BAR_OFFSET = new Vector3(0, 1, 0);
    private static readonly SHIELD_BAR_OFFSET = new Vector3(0, 1.1, 0);
    private static readonly NAMEPLATE_OFFSET = new Vector3(0, 1.2, 0);
    private static readonly RING_OFFSET = new Vector3(0, 0.01, 0);
    private static readonly NAMEPLACE_SPACING = 0.015;

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
    private recordingAudioListener: AudioListener;

    private shootAudioBuffer: AudioBuffer | undefined;
    private engineAudioHandler: EngineAudioHandler;

    private font: Font | undefined;

    private controlledPlayerId: number;

    private menuPlayerModelId: string | undefined;
    private menuPlayerModelColors: string[] | undefined;

    constructor(scene: Scene, audioListener: AudioListener, recordingAudioListener: AudioListener, useMP3: boolean) {
        super();

        this.modelLoader = new ModelLoader();

        this.players = [];
        this.billboardOwners = [];
        this.sphereOwners = [];

        this.scene = scene;
        this.camera = Globals.getGlobal(Globals.Global.CAMERA);

        let extension;
        if (useMP3) {
            extension = ".mp3";
        } else {
            extension = ".ogg";
        }

        this.audioListener = audioListener;
        this.recordingAudioListener = recordingAudioListener;

        const audioLoader = new AudioLoader();
        this.engineAudioHandler = new EngineAudioHandler(audioLoader, this.audioListener, this.recordingAudioListener, extension);

        // @ts-ignore Disregard additional arguments
        audioLoader.load(location.pathname + "res/audio/effects/game/shoot" + extension, (buffer: AudioBuffer) => {
            this.shootAudioBuffer = buffer;
        });

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
        const modelId = this.menuPlayerModelId || TankCustomizationHandler.DEFAULT_MODEL_ID;
        const modelColors = this.menuPlayerModelColors || TankCustomizationHandler.DEFAULT_COLORS;

        this.addPlayer(ScenePlayerHandler.MENU_PLAYER_ID, modelId, new Vector4(2.5, 0, 2.5, Math.PI / 4), "", false, true, modelColors);
    }

    public async updateMenuPlayer(modelId: string, modelColors: string[]) {
        this.menuPlayerModelId = modelId;
        this.menuPlayerModelColors = modelColors;
        this.removePlayer({
            id: ScenePlayerHandler.MENU_PLAYER_ID,
        }, false);
        this.addPlayer(ScenePlayerHandler.MENU_PLAYER_ID, modelId, new Vector4(2.5, 0, 2.5, Math.PI / 4), "", false, true, modelColors);
    }

    public updateMenuPlayerColor(detail: string, materialTitle: string, index: number) {
        const player = this.players.find((currentPlayer) => {
            return currentPlayer.id === ScenePlayerHandler.MENU_PLAYER_ID;
        })!;
        this.updateGroupColor(player, materialTitle, detail);
        this.menuPlayerModelColors![index] = detail;
    }

    private async onPlayerAddition(data: any) {
        this.addPlayer(data.id, data.modelId, data.pos, name, false, false, data.modelColors, data.color, data.headOffset);
    }

    private onConnectedPlayerAddition(data: any) {
        this.addPlayer(data.id, data.modelId, data.pos, data.name, true, false, data.modelColors, data.color, data.headOffset, data.rank);
    }

    private updateGroupColor(player: IPlayerObj, materialTitle: string, detail: string) {

        const newMaterial = MaterialHandler.getMaterial(detail);

        const headMaterialIndex = this.modelLoader.headMaterialIndicesByNamesByMesh.get(player.modelId)!.get(materialTitle);
        if (headMaterialIndex !== undefined) {
            const meshMaterial = (player.group.getObjectByName("head") as Mesh).material as Material[];
            meshMaterial[headMaterialIndex] = newMaterial;
        }

        const bodyMaterialIndex = this.modelLoader.bodyMaterialIndicesByNamesByMesh.get(player.modelId)!.get(materialTitle);
        if (bodyMaterialIndex !== undefined) {
            const meshMaterial = (player.group.getObjectByName("body") as Mesh).material as Material[];
            meshMaterial[bodyMaterialIndex] = newMaterial;
        }
    }

    private async addPlayer(id: number, modelId: string, pos: Vector4, name: string, isConnectedPlayer: boolean, noSound: boolean, modelColors: string[], teamColor?: number, headOffset?: number, rank?: string): Promise<IPlayerObj> {
        const group = new Group();
        group.position.set(pos.x, pos.y, pos.z);

        if (teamColor) {
            this.generateRing(teamColor, group.position.clone().add(ScenePlayerHandler.RING_OFFSET), new Quaternion());
        }

        this.scene.add(group);

        const playerObj: IPlayerObj = {
            id,
            modelId,
            group,
            movementVelocity: 0,
            headOffset,
        };

        if (isConnectedPlayer) {
            const nameplate = this.generateNameplate(name, rank!, teamColor!);
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

        const result = await this.modelLoader.getGroup(modelId, headOffset);
        const head = result.getObjectByName("head") as Mesh;
        const body = result.getObjectByName("body") as Mesh;

        group.add(body, head);

        playerObj.body = body;
        playerObj.head = head;

        this.rotate(playerObj, pos.w, pos.w);

        for (let i = 0; i < modelColors.length; i ++) {
            this.updateGroupColor(playerObj, "" + i, modelColors[i]);
        }

        return playerObj;
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

            const nameplate = playerObj.nameplate;

            this.rotate(playerObj, data.bodyRot, data.headRot);

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

    private rotate(player: IPlayerObj, bodyRotation: number, headRotation: number) {
        if (player.body) {
            player.body.rotation.y = bodyRotation;
        }

        if (player.head) {

            let headOffset = player.headOffset;
            if (!headOffset) {
                headOffset = this.modelLoader.modelHeadOffsets.get(player.modelId);
            }
            if (headOffset) {
                player.head.position.set(Math.sin(bodyRotation) * headOffset, 0, Math.cos(bodyRotation) * headOffset);
            }

            player.head.rotation.y = headRotation;
        }
    }

    private addProtectionSphere(id: number) {
        const playerObj = this.players.find((player) => {
            return player.id === id;
        });

        if (playerObj) {
            this.generateProtectionSphere(playerObj.group.position);
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

    private generateNameplate(name: string, longRank: string, color: number) {
        if (this.font) {
            const rank = RankCalculator.getShortRank(longRank);

            // @ts-ignore Types specification is not correct.
            const nameShapes = this.font.generateShapes(name, 0.1);
            // @ts-ignore Types specification is not correct.
            const rankShapes = this.font.generateShapes(rank, 0.1);

            const nameGeometry = new ShapeBufferGeometry(nameShapes);
            const rankGeometry = new ShapeBufferGeometry(rankShapes);

            nameGeometry.computeBoundingBox();
            rankGeometry.computeBoundingBox();

            const nameXMid = -0.5 * (nameGeometry.boundingBox.max.x - nameGeometry.boundingBox.min.x);
            const rankXMid = -0.5 * (rankGeometry.boundingBox.max.x - rankGeometry.boundingBox.min.x);

            nameGeometry.translate(nameXMid - rankXMid + ScenePlayerHandler.NAMEPLACE_SPACING, 0, 0);
            rankGeometry.translate(rankXMid + nameXMid - ScenePlayerHandler.NAMEPLACE_SPACING, 0, 0);

            const nameMaterial = new MeshBasicMaterial({
                color,
            });
            const rankMaterial = new MeshBasicMaterial({
                color: RankCalculator.getRankColor(longRank)!,
            });

            const nameMesh = new Mesh(nameGeometry, nameMaterial);
            const rankMesh = new Mesh(rankGeometry, rankMaterial);

            const group = new Group();
            group.add(nameMesh, rankMesh);

            return group;
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
            player.group.add(audio);

            audio.onEnded = () => {
                audio.isPlaying = false;
                player.group.remove(audio);
            };

            audio.setBuffer(buffer);
            audio.play();
        }

        if (Globals.getGlobal(Globals.Global.IS_RECORDING)) {
            const recordedAudio = new PositionalAudio(this.recordingAudioListener);
            player.group.add(recordedAudio);

            recordedAudio.onEnded = () => {
                recordedAudio.isPlaying = false;
                player.group.remove(recordedAudio);
            };

            recordedAudio.setBuffer(buffer);
            recordedAudio.play();
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
