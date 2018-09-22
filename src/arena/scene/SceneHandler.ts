import {Scene, Color, PlaneGeometry, Mesh, MeshLambertMaterial, HemisphereLight, DirectionalLight, Vector3, BufferGeometry, Float32BufferAttribute, LineSegments, LineDashedMaterial, BoxGeometry, Geometry, Object3D, AudioListener}from 'three';

import Component from '../../component/ChildComponent';
import EventHandler from '../../EventHandler';
import CollisionHandler from '../CollisionHandler';
import SceneSingleplayerToolHandler from './SceneSingleplayerToolHandler';
import ScenePlayerHandler from './ScenePlayerHandler';



export default class SceneHandler extends Component{

    title: string;
    width: number;
    height: number;

    floor: Mesh;
    lines: Mesh;
    lights: Array<Object3D>;
    blocks: Mesh;

    scene: Scene;

    blockPositions: Array<Vector3>;
    initialSpawnPositions: Array<Vector3>;
    gameSpawnPositions: Array<Vector3>;

    sceneSingleplayerToolHandler: SceneSingleplayerToolHandler;
    scenePlayerHandler: ScenePlayerHandler;

    constructor(audioListener: AudioListener){
        super();

        this.title = undefined;
        this.width = undefined;
        this.height = undefined;

        this.blockPositions = [];
        this.initialSpawnPositions = [];
        this.gameSpawnPositions = [];


        this.floor = undefined;
        this.lines = undefined;
        this.lights = undefined;
        this.blocks = undefined;

        this.scene = new Scene();
        this.scene.background = new Color(0x1e1e20);

        this.sceneSingleplayerToolHandler = new SceneSingleplayerToolHandler(this);
        this.scenePlayerHandler = new ScenePlayerHandler(this.scene, audioListener);

    }

    enable(){
        EventHandler.addListener(this, EventHandler.Event.SP_GAMEMENU_SAVE_GAME_REQUEST, this.onSaveGameRequest);
        EventHandler.addListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onSceneUpdate);


        this.attachChild(this.scenePlayerHandler);
        this.attachChild(this.sceneSingleplayerToolHandler);
    }

    disable(){
        EventHandler.removeListener(this, EventHandler.Event.SP_GAMEMENU_SAVE_GAME_REQUEST, this.onSaveGameRequest);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onSceneUpdate);

        this.detachChild(this.scenePlayerHandler);
        this.detachChild(this.sceneSingleplayerToolHandler);

        this.clearScene();
    }

    onSceneUpdate(data){
        this.title = data.title;
        this.width = data.width + 2;
        this.height = data.height + 2;

        this.clearScene();

        this.floor = this.createFloor();
        this.lines = this.createLines();
        this.lights = this.createLights();

        let positions = this.parsePositionData(data.blockLocations);

        CollisionHandler.updateBlockPositions(positions);
        

        this.gameSpawnPositions = this.parsePositionData(data.gameSpawnLocations) || [];
        this.initialSpawnPositions = this.parsePositionData(data.initialSpawnLocations) || [];

        EventHandler.callEvent(EventHandler.Event.ARENA_BLOCKLOCATION_UPDATE, this.blockPositions);
        EventHandler.callEvent(EventHandler.Event.ARENA_INITIALSPAWN_UPDATE, this.initialSpawnPositions);
        EventHandler.callEvent(EventHandler.Event.ARENA_GAMESPAWN_UPDATE, this.gameSpawnPositions);


        this.updateBlocks(positions);
        
        this.scene.add(this.lines);
        this.scene.add(this.floor);
        this.scene.add(this.blocks);
        this.scene.add.apply(this.scene, this.lights);
    }

    

    onSaveGameRequest(){
        let blockData = this.generatePositionData(this.blockPositions);
        let gameSpawnData = this.generatePositionData(this.gameSpawnPositions);
        let initialSpawnData = this.generatePositionData(this.initialSpawnPositions);
        let saveObject = {
            title: this.title,
            width: this.width - 2,
            height: this.height - 2,
            blockPositions: blockData,
            gameSpawnPositions: gameSpawnData,
            initialSpawnPositions: initialSpawnData
        };
        let blob = new Blob([JSON.stringify(saveObject)], {type : "application/json"});
        let objectURL = URL.createObjectURL(blob);
        let anchor = document.createElement('a');
        anchor.download = saveObject.title + '.json';
        anchor.href = objectURL;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(objectURL);
    }

    createLines(){
        let diff = 0.3125;
        let geo = new BufferGeometry();
        let positions = [];
        for(let i = 2; i < this.width - 1; i ++){
            positions.push(i, 0.0001, diff);
            positions.push(i, 0.0001, this.height + diff - 1);
        }
        for(let i = 2; i < this.height - 1; i ++){
            positions.push(diff, 0.0001, i);
            positions.push(this.width + diff - 1, 0.0001, i);
        }
        geo.addAttribute('position', new Float32BufferAttribute(positions, 3));
        // @ts-ignore Type check error incorrect.
        let lineSegments = new LineSegments(geo, new LineDashedMaterial({
            color: 0x000000,
            dashSize: 0.375,
            gapSize: 0.125
        }));
        lineSegments.computeLineDistances();
        return lineSegments;
    }

    createLights(){
        let hemiLight = new HemisphereLight( 0xffffff, 0xffffff, 0.6 );
        hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        hemiLight.position.copy(this.getCenter().setY(50));

        let dirLight = new DirectionalLight( 0xffffff, 1 );
        dirLight.color.setHSL( 0.1, 1, 0.95 );
        dirLight.position.set(45, 30, 25);
        dirLight.target.position.copy(this.getCenter());
        return [dirLight, dirLight.target, hemiLight];
    }

    createFloor(){
        let geometry = new PlaneGeometry(this.width, this.height);
        let material = new MeshLambertMaterial({color:0x2e3334});
        let floor = new Mesh(geometry, material);
        floor.rotation.x -= Math.PI / 2;
        floor.position.copy(this.getCenter());
        floor.receiveShadow = true;
        return floor;
    }

    updateBlocks(positions: Array<Vector3>){
        let blockGeometries = [];
        let masterGeo = new Geometry();
        if(positions){
            for(let i = 0; i < positions.length; i ++){
                let pos = positions[i];
                let geo = new BoxGeometry();
                for(let i = 0; i < geo.vertices.length; i ++){
                    geo.vertices[i].add(pos);
                }
                masterGeo.merge(geo);
            }
        }else{
            //New world; Create wall.
            for(let i = 0; i < this.height; i ++){
                let geo = new BoxGeometry();
                let pos = new Vector3(this.width - 1, 0, i);
                for(let i = 0; i < geo.vertices.length; i ++){
                    geo.vertices[i].add(pos);
                }
                blockGeometries.push(pos.clone());
                masterGeo.merge(geo);

                geo = new BoxGeometry();
                pos.set(0, 0, i);
                for(let i = 0; i < geo.vertices.length; i ++){
                    geo.vertices[i].add(pos);
                }
                blockGeometries.push(pos);
                masterGeo.merge(geo);
                masterGeo.mergeVertices();
            }

            for(let i = 1; i < this.width - 1; i ++){
                let geo = new BoxGeometry();
                let pos = new Vector3(i, 0, this.height - 1);
                for(let i = 0; i < geo.vertices.length; i ++){
                    geo.vertices[i].add(pos);
                }
                blockGeometries.push(pos.clone());
                masterGeo.merge(geo);

                geo = new BoxGeometry();
                pos.set(i, 0, 0);
                for(let i = 0; i < geo.vertices.length; i ++){
                    geo.vertices[i].add(pos);
                }
                blockGeometries.push(pos);
                masterGeo.merge(geo);
                masterGeo.mergeVertices();
            }
        }
        masterGeo.mergeVertices();

        if(this.blocks){
            this.blocks.geometry = masterGeo;
            //this.blocks.needsUpdate = true;
            
        }else{
            let material = new MeshLambertMaterial({color: 0x0077ef});
            this.blocks = new Mesh(masterGeo, material);
            this.blocks.position.addScalar(0.5);
            if(positions){
                this.blockPositions = positions;
            }else{
                this.blockPositions = blockGeometries;
            }
        }
    }

    clearScene(){
        if(this.floor){
            this.scene.remove(this.floor);
            this.floor = undefined;
        }
        if(this.lines){
            this.scene.remove(this.lines);
            this.lines = undefined;
        }
        if(this.blocks){
            this.scene.remove(this.blocks);
            this.blocks = undefined;
        }
        if(this.lights){
            this.scene.remove.apply(this.scene, this.lights);
            this.lights = undefined;
        }
        if(this.blockPositions){
            this.blockPositions = [];
        }
        this.scenePlayerHandler.clearPlayers();
    }

    getScene(){
        return this.scene;
    }

    getCenter(){
        return new Vector3(this.width / 2, 0, this.height / 2);
    }

    generatePositionData(data): Array<number>{
        let positionCount = data.length;
        let output = [];
        for(let i = 0; i < positionCount; i ++){
            let loc = data[i];
            output.push(loc.x, loc.y, loc.z);
        }
        return output;
    }

    parsePositionData(data): Array<Vector3>{
        if(data){
            let dataCount = data.length;
            if(dataCount % 3 === 0){
                let positions = [];
                for(let i = 0; i < dataCount / 3; i ++){
                    let x = data[i * 3];
                    let y = data[i * 3 + 1];
                    let z = data[i * 3 + 2];
    
                    positions.push(new Vector3(x, y, z));
                }
                return positions;
            }else{
                console.log('Invalid block position data');
            }
        }
    }
}
