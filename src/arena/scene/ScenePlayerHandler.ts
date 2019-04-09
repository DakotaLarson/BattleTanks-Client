import { AudioBuffer, AudioListener, AudioLoader, BackSide, Color, DoubleSide, Font, FontLoader, FrontSide, Group, Mesh, MeshBasicMaterial, MeshLambertMaterial, PerspectiveCamera, PositionalAudio, RingBufferGeometry, RingGeometry, Scene, ShaderMaterial, Shape, ShapeBufferGeometry, SphereGeometry, Vector2, Vector3, Vector4} from "three";
import ChildComponent from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import Globals from "../../Globals";
import IPlayerObj from "../../interfaces/IPlayerObj";
import Options from "../../Options";
import BatchHandler from "./BatchHandler";
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
            this.removePlayer(player, true);
        }
        this.players.clear();
    }

    public addMenuPlayer() {
        const ringGeo = new RingBufferGeometry(0.85, 1, 16);
        ringGeo.rotateX(-Math.PI / 2);

        // const mesh = BatchHandler.create(ringGeo, [new Vector3(2.5, 0.01, 2.5)], 0xaa88d6);
        setTimeout(() => {
        //     // BatchHandler.add(mesh, new Vector3(2, 0.1, 2), 0xff99ff);
            // this.addPlayer(0, new Vector4(4, 0, 2.5, Math.PI / 4), "test", true, true, 0xff0000);
        //     this.addPlayer(0, new Vector4(1, 0, 2.5, 7 * Math.PI / 4), "test1", true, true, 0x0000ff);
        }, 1000);
        // this.scene.add(mesh);

        // const bar = this.generateBar(0x00ff00, 0);
        const obj = this.createObj();
        this.scene.add(obj);
    }

    private createObj() {
        const containerShape = new Shape();

        const fullWidth = 0.75;
        const fullHeight = 0.25;

        containerShape.moveTo(0, 0);
        containerShape.lineTo(0, fullHeight);
        containerShape.lineTo(fullWidth, fullHeight);
        containerShape.lineTo(fullWidth, 0);
        containerShape.lineTo(0, 0);

        const containerGeo = new ShapeBufferGeometry(containerShape);
        containerGeo.translate(-fullWidth / 2, -fullHeight / 2, 0);

        const vertexShader = `
            uniform vec2 size;
            uniform vec3 center;

            varying float remainingPos;

            vec3 billboard(vec3 v, mat4 view) {
                vec3 look = normalize(cameraPosition - center);
                vec3 cameraUp = vec3(view[0][1], view[1][1], view[2][1]);
                vec3 billboardRight = cross(cameraUp, look);
                vec3 billboardUp = cross(look, billboardRight);
                vec3 pos = center + billboardRight * v.x * size.x + billboardUp * v.y * size.y;
                return pos;
            }

            void main() {
                remainingPos = (position.x + size.x / 2.0) / size.x;

                vec3 worldPos = billboard(position, viewMatrix);
                gl_Position = projectionMatrix * viewMatrix * vec4(worldPos, 1.0);
            }
        `;

        const fragmentShader = `
            uniform float remainingPercentage;
            uniform vec3 remainingColor;

            varying float remainingPos;

            void main() {
                if (remainingPos <= remainingPercentage) {
                    gl_FragColor = vec4(remainingColor, 1.0);
                } else {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                }
            }
        `;

        const containerMaterial = new ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                size: {
                    value: new Vector2(fullWidth, fullHeight),
                },
                center: {
                    value: new Vector3(1, 0.5, 1),
                },
                remainingPercentage: {
                    value: 0.33,
                },
                remainingColor: {
                    value: new Color(0x00ff00),
                },
            },
        });

        const containerMesh = new Mesh(containerGeo, containerMaterial);
        console.log(containerMesh);
        containerMesh.frustumCulled = false;
        return containerMesh;
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
            const ring = this.generateRing(color);
            ring.position.add(ScenePlayerHandler.RING_OFFSET);
            group.add(ring);
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

            const healthBar = this.generateHealthBar(1);
            healthBar.position.add(ScenePlayerHandler.HEALTH_BAR_OFFSET);

            const shieldBar = this.generateShieldBar(0);
            shieldBar.position.add(ScenePlayerHandler.SHIELD_BAR_OFFSET);

            group.add(nameplate, healthBar, shieldBar);

            playerObj.nameplate = nameplate;
            playerObj.healthBar = healthBar;
            playerObj.shieldBar = shieldBar;
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
                playerObj.group.remove(healthBar);
            }

            healthBar = this.generateHealthBar(data.health);

            healthBar.position.copy(playerObj.body.position).add(ScenePlayerHandler.HEALTH_BAR_OFFSET);

            healthBar.lookAt(this.camera.position);

            playerObj.group.add(healthBar);
            playerObj.healthBar = healthBar;
        }
    }

    private onShieldChange(data: any) {
        const playerObj = this.players.get(data.id);
        if (playerObj) {
            let shieldBar = playerObj.shieldBar;
            if (shieldBar) {
                playerObj.group.remove(shieldBar);
            }

            shieldBar = this.generateShieldBar(data.shield);

            shieldBar.position.copy(playerObj.body.position).add(ScenePlayerHandler.SHIELD_BAR_OFFSET);

            shieldBar.lookAt(this.camera.position);

            playerObj.group.add(shieldBar);
            playerObj.shieldBar = shieldBar;
        }
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

        containerGeo.translate(-fullWidth / 2, -fullHeight / 2, 0);
        barGeo.translate(-fullWidth / 2, -fullHeight / 2, 0.01);

        const vertexShader = `
            uniform vec2 size;
            uniform vec3 center;

            varying float remainingPos;

            vec3 billboard(vec3 v, mat4 view) {
                vec3 up = vec3(view[0][1], view[1][1], view[2][1]);
                vec3 right = vec3(view[0][0], view[1][0], view[2][0]);
                vec3 pos = center + right * v.x + up * v.y;
                return pos;
            }

            void main() {
                remainingPos = (position.x + size.x / 2.0) / size.x;
                vec3 worldPos = billboard(position, viewMatrix);
                gl_Position = projectionMatrix * viewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * (modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0) + vec4(position.x, position.y, position.z, 0.0));
            }
        `;

        const fragmentShader = `
            uniform float remainingPercentage;
            uniform vec3 remainingColor;
            varying float remainingPos;

            void main() {
                if (remainingPos <= remainingPercentage) {
                    gl_FragColor = vec4(remainingColor, 1.0);
                } else {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                }
            }
        `;

        const containerMaterial = new ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                size: {
                    value: new Vector2(0.75, 0.0625),
                },
                center: {
                    value: new Vector2(0, 0),
                },
                remainingPercentage: {
                    value: 0.33,
                },
                remainingColor: {
                    value: new Color(0x00ff00),
                },
            },
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

    private generateRing(color: number) {
        const ringGeo = new RingGeometry(0.85, 1, 16);
        const ringMaterial = new MeshLambertMaterial({
            color,
        });
        const ringMesh = new Mesh(ringGeo, ringMaterial);
        ringMesh.rotateX(-Math.PI / 2);

        return ringMesh;
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
