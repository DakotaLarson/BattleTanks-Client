import { AudioBuffer, AudioListener, AudioLoader, BoxGeometry, CylinderGeometry, DoubleSide, Font, FontLoader, Geometry, Group, Mesh, MeshBasicMaterial, MeshLambertMaterial, PerspectiveCamera, PositionalAudio, Scene, Shape, ShapeBufferGeometry, Vector3, Vector4} from "three";
import Component from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";
import Options from "../../Options";

interface IPlayerObj {
    body: Mesh;
    head: Mesh;
    nameplate?: Mesh;
    healthBar?: Group;
    shieldBar?: Group;
}

export default class ScenePlayerHandler extends Component {

    private scene: Scene;
    private camera: PerspectiveCamera;

    private players: Map<number, IPlayerObj>;

    private playerBodyWidth: number;
    private playerBodyHeight: number;
    private playerBodyDepth: number;

    private audioListener: AudioListener;

    private shootSoundBuffer: AudioBuffer | undefined;

    private font: Font | undefined;

    private controlledPlayerId: number;

    private playerOffset: Vector3;

    private healthBarOffset = 0.65;
    private shieldBarOffset = 0.725;
    private nameplateOffset = 0.8;

    constructor(scene: Scene, audioListener: AudioListener) {
        super();
        this.players = new Map();

        this.scene = scene;
        this.camera = Globals.getGlobal(Globals.Global.CAMERA);
        this.audioListener = audioListener;

        const audioLoader = new AudioLoader();

        // @ts-ignore Disregard additional arguments
        audioLoader.load(location.pathname + "res/audio/game/shoot.mp3", (buffer: AudioBuffer) => {
            this.shootSoundBuffer = buffer;
        });

        const fontLoader = new FontLoader();
        fontLoader.load(location.pathname + "res/font/Bombardier_Regular.json", (font: Font) => {
            this.font = font;
        });

        this.playerBodyWidth = 1;
        this.playerBodyHeight = 0.55;
        this.playerBodyDepth = 1.5;

        this.controlledPlayerId = -1;

        this.playerOffset = new Vector3(0.5, this.playerBodyHeight / 2, 0.5);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_REMOVAL, this.removePlayer);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_MOVE, this.onPlayerMove);

        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_ADDITION, this.onConnectedPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_REMOVAL, this.removePlayer);
        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.addListener(this, EventHandler.Event.PLAYER_SHOOT, this.onShoot);
        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_SHOOT, this.onShoot);

        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_HEALTH_CHANGE, this.onHealthChange);
        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_SHIELD_CHANGE, this.onShieldChange);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_REMOVAL, this.removePlayer);
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_MOVE, this.onPlayerMove);

        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_ADDITION, this.onConnectedPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_REMOVAL, this.removePlayer);
        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.removeListener(this, EventHandler.Event.PLAYER_SHOOT, this.onShoot);
        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_SHOOT, this.onShoot);

        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_HEALTH_CHANGE, this.onHealthChange);
        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_SHIELD_CHANGE, this.onShieldChange);
    }

    public clearPlayers() {
        const playerValues = this.players.values();
        let playerValue = playerValues.next();
        while (!playerValue.done) {
            const playerObj = playerValue.value;
            this.scene.remove(playerObj.body, playerObj.head);
            if (playerObj.nameplate) {
                this.scene.remove(playerObj.nameplate);
            }
            if (playerObj.healthBar) {
                this.scene.remove(playerObj.healthBar);
            }
            if (playerObj.shieldBar) {
                this.scene.remove(playerObj.shieldBar);
            }

            playerValue = playerValues.next();
        }
    }

    private onPlayerAddition(data: any) {
        const name = Options.options.username;
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

            head.position.copy(pos).add(this.playerOffset);
            head.rotation.y = data.headRot;

            body.position.copy(pos).add(this.playerOffset);
            body.rotation.y = data.bodyRot;

            const cameraPos = this.camera.position;

            if (nameplate) {
                const nameplatePos = nameplate.position;
                nameplatePos.copy(pos).add(this.playerOffset).add(new Vector3(0, this.nameplateOffset, 0));

                nameplate.lookAt(cameraPos);
            }
            if (healthBar) {
                const healthBarPos = healthBar.position;
                healthBarPos.copy(pos).add(this.playerOffset).add(new Vector3(0, this.healthBarOffset, 0));

                healthBar.lookAt(cameraPos);
            }
            if (shieldBar) {
                const shieldBarPos = shieldBar.position;
                shieldBarPos.copy(pos).add(this.playerOffset).add(new Vector3(0, this.shieldBarOffset, 0));

                shieldBar.lookAt(cameraPos);
            }
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
            this.players.delete(data.id);
            if (this.controlledPlayerId === data.id) {
                this.controlledPlayerId = -1;
            }
        }
    }

    private addPlayer(id: number, pos: Vector4, name: string, color: number, isConnectedPlayer: boolean) {
        const playerGeo = new Geometry();
        const playerHeadGeo = new Geometry();

        const bodyGeo = new BoxGeometry(this.playerBodyWidth, this.playerBodyHeight, this.playerBodyDepth);
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

        const headOffset = new Vector3(0, this.playerBodyHeight / 2 + 0.35 / 2, 0);
        const turretOffset = new Vector3(0, this.playerBodyHeight / 2 + 0.35 / 2, 0.25);

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
            nameplateMesh.position.copy(bodyPos).add(this.playerOffset).add(new Vector3(0, this.nameplateOffset, 0));
            this.scene.add(nameplateMesh);

            const healthBar = this.generateHealthBar(1);
            healthBar.position.copy(bodyPos).add(this.playerOffset).add(new Vector3(0, this.healthBarOffset, 0));
            this.scene.add(healthBar);

            const shieldBar = this.generateShieldBar(0);
            shieldBar.position.copy(bodyPos).add(this.playerOffset).add(new Vector3(0, this.shieldBarOffset, 0));
            this.scene.add(shieldBar);

            playerObj = {
                body: bodyMesh,
                head: headMesh,
                nameplate: nameplateMesh,
                healthBar,
                shieldBar,
            };
        } else {
            playerObj = {
                body: bodyMesh,
                head: headMesh,
            };
        }

        this.players.set(id, playerObj);

        if (!isConnectedPlayer) {
            this.controlledPlayerId = id;
        }
    }

    private onShoot(playerId?: number) {
        if (!playerId) {
            playerId = this.controlledPlayerId;
        }
        const player = this.players.get(playerId);
        this.playSound(player as IPlayerObj, this.shootSoundBuffer as AudioBuffer);
    }

    private onHealthChange(data: any) {
        const playerObj = this.players.get(data.id);
        if (playerObj) {
            let healthBar = playerObj.healthBar;
            if (healthBar) {
                this.scene.remove(healthBar);
            }

            healthBar = this.generateHealthBar(data.health);

            healthBar.position.copy(playerObj.body.position).add(new Vector3(0, this.healthBarOffset, 0));

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

            shieldBar.position.copy(playerObj.body.position).add(new Vector3(0, this.shieldBarOffset, 0));

            shieldBar.lookAt(this.camera.position);

            this.scene.add(shieldBar);
            playerObj.shieldBar = shieldBar;
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

    private playSound(player: IPlayerObj, buffer: AudioBuffer) {

        const volume = Options.options.gameVolume;
        if (volume) {
            const head = player.head;

            const audio = new PositionalAudio(this.audioListener);
            audio.setVolume(volume);

            head.add(audio);

            audio.onEnded = () => {
                audio.isPlaying = false;
                head.remove(audio);
            };

            audio.setBuffer(buffer);
            audio.play();
        }
    }
}
