import {AudioListener, BoxGeometry, BufferGeometry, CircleGeometry, Color, DirectionalLight, Float32BufferAttribute, Geometry, HemisphereLight, LineDashedMaterial, LineSegments, Mesh, MeshLambertMaterial, Object3D, PlaneGeometry, Scene, Vector3, Vector4} from "three";

import Component from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import CollisionHandler from "../CollisionHandler";
import ScenePlayerHandler from "./ScenePlayerHandler";
import SceneSingleplayerToolHandler from "./SceneSingleplayerToolHandler";

export default class SceneHandler extends Component {

    public title: string | undefined;
    public width: number;
    public height: number;

    public floor: Mesh | undefined;
    public lines: Mesh | undefined;
    public lights: Object3D[] | undefined;
    public blocks: Mesh | undefined;

    public gameSpawnVisuals: Mesh | undefined;
    public initialSpawnVisuals: Mesh | undefined;

    public scene: Scene;

    public blockPositions: Vector3[];
    public initialSpawnPositions: Vector4[];
    public gameSpawnPositions: Vector4[];

    public sceneSingleplayerToolHandler: SceneSingleplayerToolHandler;
    public scenePlayerHandler: ScenePlayerHandler;

    constructor(audioListener: AudioListener) {
        super();
        this.blockPositions = [];

        this.width = 0;
        this.height = 0;

        this.initialSpawnPositions = [];
        this.gameSpawnPositions = [];

        this.scene = new Scene();
        this.scene.background = new Color(0x1e1e20);

        this.sceneSingleplayerToolHandler = new SceneSingleplayerToolHandler(this);
        this.scenePlayerHandler = new ScenePlayerHandler(this.scene, audioListener);

    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.SP_GAMEMENU_SAVE_GAME_REQUEST, this.onSaveGameRequest);
        EventHandler.addListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onSceneUpdate);

        this.attachChild(this.scenePlayerHandler);
        this.attachChild(this.sceneSingleplayerToolHandler);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.SP_GAMEMENU_SAVE_GAME_REQUEST, this.onSaveGameRequest);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onSceneUpdate);

        this.detachChild(this.scenePlayerHandler);
        this.detachChild(this.sceneSingleplayerToolHandler);

        this.clearScene();
    }

    public onSceneUpdate(data: any) {
        this.title = data.title;
        this.width = data.width + 2;
        this.height = data.height + 2;

        this.clearScene();

        this.floor = this.createFloor();
        this.lines = this.createLines();
        this.lights = this.createLights();

        const positions = this.parsePositionData(data.blockPositions);

        CollisionHandler.updateBlockPositions(positions);

        this.gameSpawnPositions = this.parseRotatedPositionData(data.gameSpawnPositions) || [];
        this.initialSpawnPositions = this.parseRotatedPositionData(data.initialSpawnPositions) || [];

        EventHandler.callEvent(EventHandler.Event.ARENA_BLOCKPOSITION_UPDATE, this.blockPositions);
        EventHandler.callEvent(EventHandler.Event.ARENA_INITIALSPAWN_UPDATE, this.initialSpawnPositions);
        EventHandler.callEvent(EventHandler.Event.ARENA_GAMESPAWN_UPDATE, this.gameSpawnPositions);

        this.updateBlocks(positions);

        this.scene.add(this.lines as Mesh);
        this.scene.add(this.floor);
        this.scene.add(this.blocks as Mesh);
        this.scene.add.apply(this.scene, this.lights);
        if (!data.fromServer) {
            this.updateSpawnVisuals();
        }
    }

    public onSaveGameRequest() {
        const blockData = this.generatePositionData(this.blockPositions);
        const gameSpawnData = this.generatePositionData(this.gameSpawnPositions);
        const initialSpawnData = this.generatePositionData(this.initialSpawnPositions);
        const saveObject = {
            title: this.title,
            width: this.width - 2,
            height: this.height - 2,
            blockPositions: blockData,
            gameSpawnPositions: gameSpawnData,
            initialSpawnPositions: initialSpawnData,
        };
        const blob = new Blob([JSON.stringify(saveObject)], {type : "application/json"});
        const objectURL = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.download = saveObject.title + ".json";
        anchor.href = objectURL;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(objectURL);
    }

    public updateSpawnVisuals() {
        if (this.gameSpawnVisuals) {
            this.scene.remove(this.gameSpawnVisuals);
        }
        if (this.initialSpawnVisuals) {
            this.scene.remove(this.initialSpawnVisuals);
        }
        const masterGameSpawnGeo = new Geometry();
        for (const pos of this.gameSpawnPositions) {
            const geo = new CircleGeometry(0.5, 16);
            geo.rotateX(-Math.PI / 2);
            for (const vert of geo.vertices) {
                vert.add(new Vector3(pos.x + 0.5, pos.y + 0.0001, pos.z + 0.5));
            }
            masterGameSpawnGeo.merge(geo);
        }
        const gameSpawnMat = new MeshLambertMaterial({
            color: 0xffff00,
        });
        const gameSpawnMesh = new Mesh(masterGameSpawnGeo, gameSpawnMat);

        const masterInitialSpawnGeo = new Geometry();
        for (const pos of this.initialSpawnPositions) {
            const geo = new CircleGeometry(0.5, 16);
            geo.rotateX(-Math.PI / 2);
            for (const vert of geo.vertices) {
                vert.add(new Vector3(pos.x + 0.5, pos.y + 0.01, pos.z + 0.5));
            }
            masterInitialSpawnGeo.merge(geo);
        }
        const initialSpawnMat = new MeshLambertMaterial({
            color: 0xff0000,
        });
        const initialSpawnMesh = new Mesh(masterInitialSpawnGeo, initialSpawnMat);

        this.scene.add(gameSpawnMesh, initialSpawnMesh);

        this.initialSpawnVisuals = initialSpawnMesh;
        this.gameSpawnVisuals = gameSpawnMesh;
    }

    public createLines() {
        const diff = 0.3125;
        const geo = new BufferGeometry();
        const positions = [];
        for (let i = 2; i < this.width - 1; i ++) {
            positions.push(i, 0.0001, diff);
            positions.push(i, 0.0001, this.height + diff - 1);
        }
        for (let i = 2; i < this.height - 1; i ++) {
            positions.push(diff, 0.0001, i);
            positions.push(this.width + diff - 1, 0.0001, i);
        }
        geo.addAttribute("position", new Float32BufferAttribute(positions, 3));
        // @ts-ignore Type check error incorrect.
        const lineSegments = new LineSegments(geo, new LineDashedMaterial({
            color: 0x000000,
            dashSize: 0.375,
            gapSize: 0.125,
        }));
        lineSegments.computeLineDistances();
        return lineSegments;
    }

    public createLights() {
        const hemiLight = new HemisphereLight( 0xffffff, 0xffffff, 0.6 );
        hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        hemiLight.position.copy(this.getCenter().setY(50));

        const dirLight = new DirectionalLight( 0xffffff, 1 );
        dirLight.color.setHSL( 0.1, 1, 0.95 );
        dirLight.position.set(45, 30, 25);
        dirLight.target.position.copy(this.getCenter());
        return [dirLight, dirLight.target, hemiLight];
    }

    public createFloor() {
        const geometry = new PlaneGeometry(this.width, this.height);
        const material = new MeshLambertMaterial({color: 0x2e3334});
        const floor = new Mesh(geometry, material);
        floor.rotation.x -= Math.PI / 2;
        floor.position.copy(this.getCenter());
        floor.receiveShadow = true;
        return floor;
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

    public clearScene() {
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
        this.scenePlayerHandler.clearPlayers();
    }

    public getScene() {
        return this.scene;
    }

    public getCenter() {
        return new Vector3(this.width / 2, 0, this.height / 2);
    }

    public generatePositionData(data: Vector3[] | Vector4[]): number[] {
        const positionCount = data.length;
        const output = [];
        for (let i = 0; i < positionCount; i ++) {
            const loc = data[i];
            output.push(loc.x, loc.y, loc.z);
            if ((loc as Vector4).w) {
                output.push((loc as Vector4).w);
            }
        }
        return output;
    }

    public parsePositionData(data: any): Vector3[] | undefined {
        if (data) {
            const dataCount = data.length;
            if (dataCount % 3 === 0) {
                const positions = [];
                for (let i = 0; i < dataCount / 3; i ++) {
                    const x = data[i * 3];
                    const y = data[i * 3 + 1];
                    const z = data[i * 3 + 2];

                    positions.push(new Vector3(x, y, z));
                }
                return positions;
            }
        }
        return undefined;
    }

    public parseRotatedPositionData(data: any): Vector4[] {
        if (data) {
            const dataCount = data.length;
            if (dataCount % 4 === 0) {
                const positions = [];
                for (let i = 0; i < dataCount / 4; i ++) {
                    const x = data[i * 4];
                    const y = data[i * 4 + 1];
                    const z = data[i * 4 + 2];
                    const w = data[i * 4 + 3];

                    positions.push(new Vector4(x, y, z, w));
                }
                return positions;
            }
        }
        return [];
    }
}
