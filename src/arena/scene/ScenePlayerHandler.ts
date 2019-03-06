import { AudioBuffer, AudioListener, AudioLoader, BackSide, BoxGeometry, CylinderGeometry, DoubleSide, Font, FontLoader, FrontSide, Geometry, GLTF, Group, Mesh, MeshBasicMaterial, MeshLambertMaterial, PerspectiveCamera, PositionalAudio, Scene, Shape, ShapeBufferGeometry, SphereGeometry, Vector3, Vector4} from "three";
import ChildComponent from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";
import IPlayerObj from "../../interfaces/IPlayerObj";
import Options from "../../Options";
import EngineAudioHandler from "./EngineAudioHandler";
import ModelLoader from "./ModelLoader";

export default class ScenePlayerHandler extends ChildComponent {

    private static readonly HEALTH_BAR_OFFSET = new Vector3(0, 0.65, 0);
    private static readonly SHIELD_BAR_OFFSET = new Vector3(0, 0.725, 0);
    private static readonly NAMEPLATE_OFFSET = new Vector3(0, 0.8, 0);
    private static readonly PROTECTION_SPHERE_OFFSET = new Vector3(0.5, 0, 0.5);

    private static readonly PLAYER_WIDTH = 1;
    private static readonly PLAYER_HEIGHT = 0.55;
    private static readonly PLAYER_DEPTH = 1.5;

    private modelLoader: ModelLoader;

    private scene: Scene;
    private camera: PerspectiveCamera;

    private players: Map<number, IPlayerObj>;

    private audioListener: AudioListener;
    private shootAudioBuffer: AudioBuffer | undefined;
    private engineAudioHandler: EngineAudioHandler;

    private font: Font | undefined;

    private controlledPlayerId: number;

    private playerOffset: Vector3;

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

        this.playerOffset = new Vector3(0.5, ScenePlayerHandler.PLAYER_HEIGHT / 2, 0.5);
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
    }

    public clearPlayers() {
        for (const [, player] of this.players) {
            this.scene.remove(player.body, player.head);
            if (player.nameplate) {
                this.scene.remove(player.nameplate);
            }
            if (player.healthBar) {
                this.scene.remove(player.healthBar);
            }
            if (player.shieldBar) {
                this.scene.remove(player.shieldBar);
            }
            if (player.protectionSphere) {
                this.scene.remove(player.protectionSphere);
            }
            if (player.engineAudio) {
                this.engineAudioHandler.stopEngineSound(player);
                this.scene.remove(player.engineAudio);
            }
        }
        this.players.clear();
    }

    public addMenuPlayer() {
        this.modelLoader.getTurretModel().then((gltf: GLTF) => {
            gltf.scene.position.add(new Vector3(2.5, 0, 2.5));
            this.scene.add(gltf.scene);
            console.log(gltf);
        });
        this.modelLoader.getBodyModel().then((gltf: GLTF) => {
            gltf.scene.position.add(new Vector3(2.5, 0, 2.5));
            this.scene.add(gltf.scene);
        });
        this.modelLoader.getTracksModel().then((gltf: GLTF) => {
            gltf.scene.position.add(new Vector3(2.5, 0, 2.5));
            this.scene.add(gltf.scene);
        });
        // this.addPlayer(0, new Vector4(2, 0, 2, Math.PI / 4), "", 0xf0f0c0, false, true);
    }

    private onPlayerAddition(data: any) {
        const name = Globals.getGlobal(Globals.Global.USERNAME);
        this.addPlayer(data.id, data.pos, name, data.color, false);
    }

    private onConnectedPlayerAddition(data: any) {
        this.addPlayer(data.id, data.pos, data.name, data.color, true);
    }

    private onPlayerMove(data: any) {
        const playerObj = this.players.get(data.id);
        if (playerObj) {
            const pos = new Vector3(data.pos.x, data.pos.y, data.pos.z);
            const body = playerObj.body;
            const head = playerObj.head;
            const nameplate = playerObj.nameplate;
            const healthBar = playerObj.healthBar;
            const shieldBar = playerObj.shieldBar;
            const protectionSphere = playerObj.protectionSphere;

            head.position.copy(pos).add(this.playerOffset);
            head.rotation.y = data.headRot;

            body.position.copy(pos).add(this.playerOffset);
            body.rotation.y = data.bodyRot;

            const cameraPos = this.camera.position;

            if (nameplate) {
                const nameplatePos = nameplate.position;
                nameplatePos.copy(pos).add(this.playerOffset).add(ScenePlayerHandler.NAMEPLATE_OFFSET);

                nameplate.lookAt(cameraPos);
            }
            if (healthBar) {
                const healthBarPos = healthBar.position;
                healthBarPos.copy(pos).add(this.playerOffset).add(ScenePlayerHandler.HEALTH_BAR_OFFSET);

                healthBar.lookAt(cameraPos);
            }
            if (shieldBar) {
                const shieldBarPos = shieldBar.position;
                shieldBarPos.copy(pos).add(this.playerOffset).add(ScenePlayerHandler.SHIELD_BAR_OFFSET);

                shieldBar.lookAt(cameraPos);
            }
            if (protectionSphere) {
                const protectionSpherePos = protectionSphere.position;
                protectionSpherePos.copy(pos).add(ScenePlayerHandler.PROTECTION_SPHERE_OFFSET);
            }
            playerObj.movementVelocity = data.movementVelocity;
            this.engineAudioHandler.updateEngineSound(playerObj);
        }
    }

    private removePlayer(data: any) {
        const obj = this.players.get(data.id);
        if (obj) {
            this.scene.remove(obj.body);
            this.scene.remove(obj.head);
            if (obj.nameplate) {
                this.scene.remove(obj.nameplate);
            }

            if (obj.healthBar) {
                this.scene.remove(obj.healthBar);
            }

            if (obj.shieldBar) {
                this.scene.remove(obj.shieldBar);
            }

            if (obj.protectionSphere) {
                this.scene.remove(obj.protectionSphere);
            }

            this.players.delete(data.id);
            if (this.controlledPlayerId === data.id) {
                this.controlledPlayerId = -1;
            }
            this.engineAudioHandler.stopEngineSound(obj);
        }
    }

    private addPlayer(id: number, pos: Vector4, name: string, color: number, isConnectedPlayer: boolean, noSound?: boolean) {
        const playerGeo = new Geometry();
        const playerHeadGeo = new Geometry();

        const bodyGeo = new BoxGeometry(ScenePlayerHandler.PLAYER_WIDTH, ScenePlayerHandler.PLAYER_HEIGHT, ScenePlayerHandler.PLAYER_DEPTH);
        const headGeo = new BoxGeometry(0.5, 0.35, 0.5);
        const turretGeo = new CylinderGeometry(0.0625, 0.0625, 0.75, 16, 1, true);
        turretGeo.rotateX(Math.PI / 2);

        const bodyMaterial = new MeshLambertMaterial({
            color,
        });

        const headMaterial = new MeshLambertMaterial({
            color,
            side: DoubleSide,
        });

        const headOffset = new Vector3(0, ScenePlayerHandler.PLAYER_HEIGHT / 2 + 0.35 / 2, 0);
        const turretOffset = new Vector3(0, ScenePlayerHandler.PLAYER_HEIGHT / 2 + 0.35 / 2, 0.25);

        for (const vert of headGeo.vertices) {
            vert.add(headOffset);
        }
        for (const vert of turretGeo.vertices) {
            vert.add(turretOffset);
        }

        playerHeadGeo.merge(headGeo);
        playerHeadGeo.merge(turretGeo);

        playerGeo.merge(bodyGeo);

        const bodyPos = new Vector3(pos.x, pos.y, pos.z);

        const bodyMesh = new Mesh(playerGeo, bodyMaterial);
        bodyMesh.position.copy(bodyPos).add(this.playerOffset);
        bodyMesh.rotation.y = pos.w;

        const headMesh = new Mesh(playerHeadGeo, headMaterial);
        headMesh.position.copy(bodyPos).add(this.playerOffset);
        headMesh.rotation.y = pos.w;

        this.scene.add(bodyMesh, headMesh);

        let playerObj: IPlayerObj;

        if (isConnectedPlayer) {
            const nameplateMesh = this.generateNameplate(name);
            nameplateMesh.position.copy(bodyPos).add(this.playerOffset).add(ScenePlayerHandler.NAMEPLATE_OFFSET);
            this.scene.add(nameplateMesh);

            const healthBar = this.generateHealthBar(1);
            healthBar.position.copy(bodyPos).add(this.playerOffset).add(ScenePlayerHandler.HEALTH_BAR_OFFSET);
            this.scene.add(healthBar);

            const shieldBar = this.generateShieldBar(0);
            shieldBar.position.copy(bodyPos).add(this.playerOffset).add(ScenePlayerHandler.SHIELD_BAR_OFFSET);
            this.scene.add(shieldBar);

            playerObj = {
                body: bodyMesh,
                head: headMesh,
                movementVelocity: 0,
                nameplate: nameplateMesh,
                healthBar,
                shieldBar,
            };
        } else {
            playerObj = {
                body: bodyMesh,
                head: headMesh,
                movementVelocity: 0,
            };
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

    private onHealthChange(data: any) {
        const playerObj = this.players.get(data.id);
        if (playerObj) {
            let healthBar = playerObj.healthBar;
            if (healthBar) {
                this.scene.remove(healthBar);
            }

            healthBar = this.generateHealthBar(data.health);

            healthBar.position.copy(playerObj.body.position).add(ScenePlayerHandler.HEALTH_BAR_OFFSET);

            healthBar.lookAt(this.camera.position);

            this.scene.add(healthBar);
            playerObj.healthBar = healthBar;
        }
    }

    private onShieldChange(data: any) {
        const playerObj = this.players.get(data.id);
        if (playerObj) {
            let shieldBar = playerObj.shieldBar;
            if (shieldBar) {
                this.scene.remove(shieldBar);
            }

            shieldBar = this.generateShieldBar(data.shield);

            shieldBar.position.copy(playerObj.body.position).add(ScenePlayerHandler.SHIELD_BAR_OFFSET);

            shieldBar.lookAt(this.camera.position);

            this.scene.add(shieldBar);
            playerObj.shieldBar = shieldBar;
        }
    }

    private onProtectionStart(id: number) {

        const playerObj = this.players.get(id);
        if (playerObj) {
            const sphere = this.generateProtectionSphere();
            sphere.position.copy(playerObj.body.position).add(ScenePlayerHandler.PROTECTION_SPHERE_OFFSET);
            this.scene.add(sphere);
            playerObj.protectionSphere = sphere;
        }
    }

    private onProtectionEnd(id: number) {
        const playerObj = this.players.get(id);
        if (playerObj && playerObj.protectionSphere) {
            this.scene.remove(playerObj.protectionSphere);
            playerObj.protectionSphere = undefined;
        }
    }

    private generateNameplate(name: string) {
        if (this.font) {
            // @ts-ignore Types specification is not remotely correct.
            const shapes = this.font.generateShapes(name, 0.175);

            const geometry = new ShapeBufferGeometry(shapes);
            geometry.computeBoundingBox();
            const xMid = - 0.5 * (geometry.boundingBox.max.x - geometry.boundingBox.min.x);
            geometry.translate(xMid, 0, 0);

            const material = new MeshBasicMaterial({
                color: 0xffffff,
            });

            const mesh = new Mesh(geometry, material);
            return mesh;
        } else {
            throw new Error("Font is not loaded");
        }
    }

    private generateHealthBar(health: number) {
        return this.generateBar(0x00ff00, health);
    }

    private generateShieldBar(shield: number) {
        return this.generateBar(0x0095d8, shield);
    }

    private generateBar(color: number, percentage: number) {
        const containerShape = new Shape();
        const barShape = new Shape();

        const fullWidth = 0.75;
        const fullHeight = 0.0625;

        containerShape.moveTo(0, 0);
        containerShape.lineTo(0, fullHeight);
        containerShape.lineTo(fullWidth, fullHeight);
        containerShape.lineTo(fullWidth, 0);
        containerShape.lineTo(0, 0);

        barShape.moveTo(0, 0);
        barShape.lineTo(0, fullHeight);
        barShape.lineTo(fullWidth * percentage, fullHeight);
        barShape.lineTo(fullWidth * percentage, 0);
        barShape.lineTo(0, 0);

        const containerGeo = new ShapeBufferGeometry(containerShape);
        const barGeo = new ShapeBufferGeometry(barShape);

        containerGeo.translate(-0.75 / 2, 0, 0);
        barGeo.translate(-0.75 / 2, 0, 0.01);

        const containerMaterial = new MeshBasicMaterial({
            color: 0x000000,
        });

        const barMaterial = new MeshBasicMaterial({
            color,
        });

        const containerMesh = new Mesh(containerGeo, containerMaterial);
        const barMesh = new Mesh(barGeo, barMaterial);

        const group = new Group();

        group.add(containerMesh, barMesh);

        return group;
    }

    private generateProtectionSphere() {
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
}
