import { AudioBuffer, AudioListener, AudioLoader, BoxGeometry, CylinderGeometry, DoubleSide, Geometry, Mesh, MeshLambertMaterial, PositionalAudio, Scene, Vector3, Vector4} from "three";
import Component from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";

interface IPlayerObj {
    body: Mesh;
    head: Mesh;
}

export default class ScenePlayerHandler extends Component {

    private scene: Scene;
    private players: Map<number, IPlayerObj>;

    private playerBodyWidth: number;
    private playerBodyHeight: number;
    private playerBodyDepth: number;

    private audioListener: AudioListener;

    private shootSoundBuffer: AudioBuffer | undefined;
    private invalidShootSoundBuffer: AudioBuffer | undefined;

    private controlledPlayerId: number;

    private playerOffset: Vector3;

    constructor(scene: Scene, audioListener: AudioListener) {
        super();
        this.players = new Map();

        this.scene = scene;

        this.audioListener = audioListener;

        const audioLoader = new AudioLoader();

        // @ts-ignore Disregard additional arguments
        audioLoader.load(location.pathname + "audio/shoot.wav", (buffer: AudioBuffer) => {
            this.shootSoundBuffer = buffer;
        });

        // @ts-ignore Disregard additional arguments
        audioLoader.load(location.pathname + "audio/shoot-invalid.wav", (buffer: AudioBuffer) => {
            this.invalidShootSoundBuffer = buffer;
        });

        this.playerBodyWidth = 1;
        this.playerBodyHeight = 0.55;
        this.playerBodyDepth = 1.5;

        this.controlledPlayerId = -1;

        this.playerOffset = new Vector3(0.5, this.playerBodyHeight / 2, 0.5);

    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.removePlayer);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.addListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_ADDITION, this.onConnectedPlayerJoin);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_REMOVAL, this.removePlayer);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_SHOOT, this.onShoot);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_SHOOT_INVALID, this.onShootInvalid);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_SHOOT, this.onShoot);

    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.removePlayer);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_ADDITION, this.onConnectedPlayerJoin);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_REMOVAL, this.removePlayer);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_SHOOT, this.onShoot);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_SHOOT_INVALID, this.onShootInvalid);
    }

    public clearPlayers() {
        const playerValues = this.players.values();
        let playerValue = playerValues.next();
        while (!playerValue.done) {
            const playerObj = playerValue.value;
            this.scene.remove(playerObj.body, playerObj.head);

            playerValue = playerValues.next();
        }
    }

    private onPlayerAddition(data: any) {
        this.addPlayer(data.id, data.pos, false);
    }

    private onConnectedPlayerJoin(data: any) {
        this.addPlayer(data.id, data.pos, true);
    }

    private onPlayerMove(data: any) {
        if (this.players.has(data.id)) {
            const playerObj = this.players.get(data.id);
            if (playerObj) {
                const pos = new Vector3(data.pos.x, data.pos.y, data.pos.z);
                const body = playerObj.body;
                const head = playerObj.head;

                head.position.copy(pos).add(this.playerOffset);
                head.rotation.y = data.headRot;

                body.position.copy(pos).add(this.playerOffset);
                body.rotation.y = data.bodyRot;
            }
        }
    }

    private removePlayer(id: number) {
        if (this.players.has(id)) {
            const obj = this.players.get(id);
            if (obj) {
                this.scene.remove(obj.body);
                this.scene.remove(obj.head);
                this.players.delete(id);
                if (this.controlledPlayerId === id) {
                    this.controlledPlayerId = -1;
                }
            }
        }
    }

    private addPlayer(id: number, pos: Vector4, isConnectedPlayer: boolean) {
        const playerGeo = new Geometry();
        const playerHeadGeo = new Geometry();

        const bodyGeo = new BoxGeometry(this.playerBodyWidth, this.playerBodyHeight, this.playerBodyDepth);
        const headGeo = new BoxGeometry(0.5, 0.35, 0.5);
        const turretGeo = new CylinderGeometry(0.0625, 0.0625, 0.75, 8, 1, true);
        turretGeo.rotateX(Math.PI / 2);

        let bodyMaterial: MeshLambertMaterial;
        let headMaterial: MeshLambertMaterial;

        if (isConnectedPlayer) {
            bodyMaterial = new MeshLambertMaterial({
                color: 0xce141a,
            });

            headMaterial = new MeshLambertMaterial({
                color: 0xce141a,
                side: DoubleSide,
            });

        } else {
            bodyMaterial = new MeshLambertMaterial({
                color: 0x1ace14,
            });

            headMaterial = new MeshLambertMaterial({
                color: 0x1ace14,
                side: DoubleSide,
            });

        }

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

        this.scene.add(bodyMesh, headMesh);

        const playerObj: IPlayerObj = {
            body: bodyMesh,
            head: headMesh,
        };

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
        if (player) {
            const head = player.head;

            const audio = new PositionalAudio(this.audioListener);

            head.add(audio);

            audio.onEnded = () => {
                audio.isPlaying = false;
                head.remove(audio);
            };

            audio.setBuffer(this.shootSoundBuffer as AudioBuffer);
            audio.play();
        }
    }

    private onShootInvalid() {
        if (this.controlledPlayerId > -1) {
            const player = this.players.get(this.controlledPlayerId);
            if (player) {
                const head = player.head;

                const audio = new PositionalAudio(this.audioListener);

                head.add(audio);

                audio.onEnded = () => {
                audio.isPlaying = false;
                head.remove(audio);
            };

                audio.setBuffer(this.invalidShootSoundBuffer as AudioBuffer);
                audio.play();
            }
        }
    }
}
