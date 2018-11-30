import {AudioListener, BoxGeometry, BufferGeometry, CircleGeometry, Color, DirectionalLight, Float32BufferAttribute, Geometry, HemisphereLight, LineDashedMaterial, LineSegments, Mesh, MeshLambertMaterial, Object3D, PlaneGeometry, Scene, Texture, TextureLoader, Vector3, Vector4} from "three";

import Component from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import CollisionHandler from "../CollisionHandler";
import ScenePlayerHandler from "./ScenePlayerHandler";
import SceneSingleplayerToolHandler from "./SceneSingleplayerToolHandler";

export default class SceneHandler extends Component {

    public blockPositions: Vector3[];
    public teamASpawnPositions: Vector4[];
    public teamBSpawnPositions: Vector4[];

    public floor: Mesh | undefined;
    public blocks: Mesh | undefined;

    private scene: Scene;

    private title: string | undefined;
    private width: number;
    private height: number;

    private lines: LineSegments | undefined;
    private lights: Object3D[] | undefined;

    private teamASpawnVisuals: Mesh | undefined;
    private teamBSpawnVisuals: Mesh | undefined;

    private scenePlayerHandler: ScenePlayerHandler;
    private sceneSingleplayerToolHandler: SceneSingleplayerToolHandler;

    private spawnVisualTexture: Texture | undefined;

    constructor(audioListener: AudioListener) {
        super();
        this.blockPositions = [];

        this.width = 0;
        this.height = 0;

        this.teamASpawnPositions = [];
        this.teamBSpawnPositions = [];

        this.scene = new Scene();
        this.scene.background = new Color(0x1e1e20);

        this.sceneSingleplayerToolHandler = new SceneSingleplayerToolHandler(this);
        this.scenePlayerHandler = new ScenePlayerHandler(this.scene, audioListener);

        this.spawnVisualTexture = undefined;
        new TextureLoader().load(location.pathname + "res/arrow.png", (texture) => {
            this.spawnVisualTexture = texture;
        });
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
        if (this.teamASpawnVisuals) {
            this.scene.remove(this.teamASpawnVisuals);
        }
        if (this.teamBSpawnVisuals) {
            this.scene.remove(this.teamBSpawnVisuals);
        }
        const teamASpawnMesh = this.createRotatedPositionsVisualMesh(this.teamASpawnPositions, 0x009247);
        const teamBSpawnMesh = this.createRotatedPositionsVisualMesh(this.teamBSpawnPositions, 0xcf2b36);

        this.scene.add(teamASpawnMesh, teamBSpawnMesh);

        this.teamASpawnVisuals = teamASpawnMesh;
        this.teamBSpawnVisuals = teamBSpawnMesh;
    }

    private createRotatedPositionsVisualMesh(positions: Vector4[], color: number) {
        const masterGeo = new Geometry();

        for (const pos of positions) {
            const geo = new CircleGeometry(0.5, 16);

            geo.rotateX(-Math.PI / 2);
            geo.rotateY(-pos.w - Math.PI / 2);

            for (const vert of geo.vertices) {
                vert.add(new Vector3(pos.x + 0.5, pos.y + 0.01, pos.z + 0.5));
            }
            masterGeo.merge(geo);
        }

        const material = new MeshLambertMaterial({
            map: this.spawnVisualTexture,
            color,
        });

        return new Mesh(masterGeo, material);
    }

    private onSceneUpdate(data: any) {
        this.title = data.title;
        this.width = data.width + 2;
        this.height = data.height + 2;

        this.clearScene();

        this.floor = this.createFloor();
        this.lines = this.createLines();
        this.lights = this.createLights();

        const positions = this.parsePositionData(data.blockPositions);

        CollisionHandler.updateBlockPositions(positions);

        this.teamASpawnPositions = this.parseRotatedPositionData(data.teamASpawnPositions) || [];
        this.teamBSpawnPositions = this.parseRotatedPositionData(data.teamBSpawnPositions) || [];

        this.updateBlocks(positions);

        this.scene.add(this.lines as LineSegments);
        this.scene.add(this.floor);
        this.scene.add(this.blocks as Mesh);
        this.scene.add.apply(this.scene, this.lights);
        if (!data.fromServer) {
            this.updateSpawnVisuals();
        }
    }

    private onSaveGameRequest() {
        const blockData = this.generatePositionData(this.blockPositions);
        const teamASpawnData = this.generatePositionData(this.teamASpawnPositions);
        const teamBSpawnData = this.generatePositionData(this.teamBSpawnPositions);

        const saveObject = {
            title: this.title,
            width: this.width - 2,
            height: this.height - 2,
            blockPositions: blockData,
            teamASpawnPositions: teamASpawnData,
            teamBSpawnPositions: teamBSpawnData,
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

    private createLines() {
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
        const lineSegments = new LineSegments(geo, new LineDashedMaterial({
            color: 0x000000,
            dashSize: 0.375,
            gapSize: 0.125,
        }));
        lineSegments.computeLineDistances();
        return lineSegments;
    }

    private createLights() {
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

    private createFloor() {
        const geometry = new PlaneGeometry(this.width, this.height);
        const material = new MeshLambertMaterial({color: 0x2e3334});
        const floor = new Mesh(geometry, material);
        floor.rotation.x -= Math.PI / 2;
        floor.position.copy(this.getCenter());
        floor.receiveShadow = true;
        return floor;
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
        if (this.teamASpawnVisuals) {
            this.scene.remove(this.teamASpawnVisuals);
            this.teamASpawnVisuals = undefined;
        }
        if (this.teamBSpawnVisuals) {
            this.scene.remove(this.teamBSpawnVisuals);
            this.teamBSpawnVisuals = undefined;
        }
        this.scenePlayerHandler.clearPlayers();
    }

    private getCenter() {
        return new Vector3(this.width / 2, 0, this.height / 2);
    }

    private generatePositionData(data: Vector3[] | Vector4[]): number[] {
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

    private parsePositionData(data: any): Vector3[] | undefined {
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

    private parseRotatedPositionData(data: any): Vector4[] {
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
