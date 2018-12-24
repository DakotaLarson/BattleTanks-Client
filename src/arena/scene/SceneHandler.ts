import {AudioListener, BoxGeometry, Color, Geometry, LineSegments, Mesh, MeshLambertMaterial, Object3D, Scene, Vector3, Vector4} from "three";

import Component from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import BlockCollisionHandler from "../collision/BlockCollisionHandler";
import ScenePlayerHandler from "./ScenePlayerHandler";
import ScenePowerupHandler from "./ScenePowerupHandler";
import SceneSingleplayerToolHandler from "./SceneSingleplayerToolHandler";
import SceneUtils from "./SceneUtils";
import SceneVisualsHandler from "./SceneVisualsHandler";

export default class SceneHandler extends Component {

    public blockPositions: Vector3[];

    public teamASpawnPositions: Vector4[];
    public teamBSpawnPositions: Vector4[];

    public shieldPowerupPositions: Vector3[];
    public healthPowerupPositions: Vector3[];
    public speedPowerupPositions: Vector3[];
    public ammoPowerupPositions: Vector3[];

    public floor: Mesh | undefined;
    public blocks: Mesh | undefined;

    public width: number;
    public height: number;

    private scene: Scene;

    private lines: LineSegments | undefined;
    private lights: Object3D[] | undefined;

    private scenePlayerHandler: ScenePlayerHandler;
    private sceneSingleplayerToolHandler: SceneSingleplayerToolHandler;
    private sceneUtils: SceneUtils;
    private sceneVisualsHandler: SceneVisualsHandler;
    private scenePowerupHandler: ScenePowerupHandler;

    constructor(audioListener: AudioListener) {
        super();
        this.width = 0;
        this.height = 0;

        this.blockPositions = [];

        this.teamASpawnPositions = [];
        this.teamBSpawnPositions = [];

        this.shieldPowerupPositions = [];
        this.healthPowerupPositions = [];
        this.speedPowerupPositions = [];
        this.ammoPowerupPositions = [];

        this.scene = new Scene();
        this.scene.background = new Color(0x1e1e20);

        this.sceneSingleplayerToolHandler = new SceneSingleplayerToolHandler(this);
        this.scenePlayerHandler = new ScenePlayerHandler(this.scene, audioListener);
        this.sceneUtils = new SceneUtils(this);
        this.sceneVisualsHandler = new SceneVisualsHandler(this, this.scene);
        this.scenePowerupHandler = new ScenePowerupHandler(this.scene);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.SP_GAMEMENU_SAVE_GAME_REQUEST, this.onSaveGameRequest);
        EventHandler.addListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onSceneUpdate);

        this.attachChild(this.scenePlayerHandler);
        this.attachChild(this.sceneSingleplayerToolHandler);
        this.attachChild(this.scenePowerupHandler);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.SP_GAMEMENU_SAVE_GAME_REQUEST, this.onSaveGameRequest);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onSceneUpdate);

        this.detachChild(this.scenePlayerHandler);
        this.detachChild(this.sceneSingleplayerToolHandler);
        this.detachChild(this.scenePowerupHandler);

        this.clearScene();
    }

    public getScene() {
        return this.scene;
    }

    public updateBlocks(positions: Vector3[] | undefined) {
        const blockGeometries = [];
        const masterGeo = new Geometry();
        if (positions) {
            for (const pos of positions) {
                const geo = new BoxGeometry();
                for (const vert of geo.vertices) {
                    vert.add(pos);
                }
                masterGeo.merge(geo);
            }
        } else {
            // New world; Create wall.
            for (let i = 0; i < this.height; i ++) {
                let geo = new BoxGeometry();
                const pos = new Vector3(this.width - 1, 0, i);
                for (const vert of geo.vertices) {
                    vert.add(pos);
                }
                blockGeometries.push(pos.clone());
                masterGeo.merge(geo);

                geo = new BoxGeometry();
                pos.set(0, 0, i);
                for (const vert of geo.vertices) {
                    vert.add(pos);
                }
                blockGeometries.push(pos);
                masterGeo.merge(geo);
                masterGeo.mergeVertices();
            }

            for (let i = 1; i < this.width - 1; i ++) {
                let geo = new BoxGeometry();
                const pos = new Vector3(i, 0, this.height - 1);
                for (const vert of geo.vertices) {
                    vert.add(pos);
                }
                blockGeometries.push(pos.clone());
                masterGeo.merge(geo);

                geo = new BoxGeometry();
                pos.set(i, 0, 0);
                for (const vert of geo.vertices) {
                    vert.add(pos);
                }
                blockGeometries.push(pos);
                masterGeo.merge(geo);
                masterGeo.mergeVertices();
            }
        }
        masterGeo.mergeVertices();

        if (this.blocks) {
            this.blocks.geometry = masterGeo;

        } else {
            const material = new MeshLambertMaterial({color: 0x0077ef});
            this.blocks = new Mesh(masterGeo, material);
            this.blocks.position.addScalar(0.5);
            if (positions) {
                this.blockPositions = positions;
            } else {
                this.blockPositions = blockGeometries;
            }
        }
    }

    public updateSpawnVisuals() {
        this.sceneVisualsHandler.update();
    }

    private onSceneUpdate(data: any) {
        this.width = data.width + 2;
        this.height = data.height + 2;

        this.clearScene();

        this.floor = this.sceneUtils.createFloor();
        this.lines = this.sceneUtils.createLines();
        this.lights = this.sceneUtils.createLights();

        const blockPositions = this.sceneUtils.parsePositionData(data.blockPositions);

        BlockCollisionHandler.updateBlockPositions(blockPositions);

        this.teamASpawnPositions = this.sceneUtils.parseRotatedPositionData(data.teamASpawnPositions) || [];
        this.teamBSpawnPositions = this.sceneUtils.parseRotatedPositionData(data.teamBSpawnPositions) || [];
        this.shieldPowerupPositions = this.sceneUtils.parsePositionData(data.shieldPowerupPositions) || [];
        this.healthPowerupPositions = this.sceneUtils.parsePositionData(data.healthPowerupPositions) || [];
        this.speedPowerupPositions = this.sceneUtils.parsePositionData(data.speedPowerupPositions) || [];
        this.ammoPowerupPositions = this.sceneUtils.parsePositionData(data.ammoPowerupPositions) || [];

        this.updateBlocks(blockPositions);

        this.scene.add(this.lines as LineSegments);
        this.scene.add(this.floor);
        this.scene.add(this.blocks as Mesh);
        this.scene.add.apply(this.scene, this.lights);
        if (!data.fromServer) {
            this.updateSpawnVisuals();
        }
    }

    private onSaveGameRequest() {
        const blockData = this.sceneUtils.generatePositionData(this.blockPositions);
        const teamASpawnPositions = this.sceneUtils.generatePositionData(this.teamASpawnPositions);
        const teamBSpawnPositions = this.sceneUtils.generatePositionData(this.teamBSpawnPositions);
        const shieldPowerupPositions = this.sceneUtils.generatePositionData(this.shieldPowerupPositions);
        const healthPowerupPositions = this.sceneUtils.generatePositionData(this.healthPowerupPositions);
        const speedPowerupPositions = this.sceneUtils.generatePositionData(this.speedPowerupPositions);
        const ammoPowerupPositions = this.sceneUtils.generatePositionData(this.ammoPowerupPositions);

        const saveObject = {
            width: this.width - 2,
            height: this.height - 2,
            blockPositions: blockData,
            teamASpawnPositions,
            teamBSpawnPositions,
            shieldPowerupPositions,
            healthPowerupPositions,
            speedPowerupPositions,
            ammoPowerupPositions,
        };
        EventHandler.callEvent(EventHandler.Event.ARENA_SAVE_REQUEST, saveObject);
    }

    private clearScene() {
        if (this.floor) {
            this.scene.remove(this.floor);
            this.floor = undefined;
        }
        if (this.lines) {
            this.scene.remove(this.lines);
            this.lines = undefined;
        }
        if (this.blocks) {
            this.scene.remove(this.blocks);
            this.blocks = undefined;
        }
        if (this.lights) {
            this.scene.remove.apply(this.scene, this.lights);
            this.lights = undefined;
        }
        if (this.blockPositions) {
            this.blockPositions = [];
        }
        this.sceneVisualsHandler.clearVisuals();
        this.scenePlayerHandler.clearPlayers();
        this.scenePowerupHandler.clearPowerups();
    }
}
