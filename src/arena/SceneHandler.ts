import {Scene, Color, PlaneGeometry, Mesh, MeshLambertMaterial, HemisphereLight, DirectionalLight, Vector3, BufferGeometry, Float32BufferAttribute, LineSegments, LineDashedMaterial, BoxGeometry, Geometry, Raycaster, Vector2, CylinderGeometry, DoubleSide, Intersection, Object3D}from 'three';

import Component from '../Component';
import EventHandler from '../EventHandler';
import Player from './player/Player';
import RaycastHandler from '../RaycastHandler';

type PlayerObj = {
    body: Mesh,
    head: Mesh
};

export default class SceneHandler extends Component{

    title: string;
    width: number;
    height: number;

    floor: Mesh;
    lines: Mesh;
    lights: Array<Object3D>;
    blocks: Mesh;

    scene: Scene;

    blocksIntersection: Intersection[];
    floorIntersection: Intersection[]

    playerBodyWidth: number;
    playerBodyHeight: number;
    playerBodyDepth: number;

    playerOffset: Vector3;

    blockLocations: Array<Vector3>;
    initialSpawnLocations: Array<Vector3>;
    gameSpawnLocations: Array<Vector3>;

    

    players: Map<number, PlayerObj>;

    constructor(){
        super();

        this.title = undefined;
        this.width = undefined;
        this.height = undefined;

        this.blockLocations = [];
        this.initialSpawnLocations = [];
        this.gameSpawnLocations = [];

        this.players = new Map();

        this.floor = undefined;
        this.lines = undefined;
        this.lights = undefined;
        this.blocks = undefined;

        this.scene = new Scene();
        this.scene.background = new Color(0x1e1e20);

        this.blocksIntersection = [];
        this.floorIntersection = [];

        this.playerBodyWidth = 1;
        this.playerBodyHeight = 0.55;
        this.playerBodyDepth = 1.5;

        this.playerOffset = new Vector3(this.playerBodyWidth/2, this.playerBodyHeight/2, this.playerBodyDepth/2 - 0.25);

    }

    enable(){
        EventHandler.addListener(this, EventHandler.Event.BLOCK_CREATION_TOOL_PRIMARY, this.onBCTPrimary);
        EventHandler.addListener(this, EventHandler.Event.BLOCK_CREATION_TOOL_SECONDARY, this.onBCTSecondary);

        EventHandler.addListener(this, EventHandler.Event.INITIALSPAWN_CREATION_TOOL_PRIMARY, this.onInitialSpawnPrimary);
        EventHandler.addListener(this, EventHandler.Event.INITIALSPAWN_CREATION_TOOL_SECONDARY, this.onInitialSpawnSecondary);

        EventHandler.addListener(this, EventHandler.Event.GAMESPAWN_CREATION_TOOL_PRIMARY, this.onGameSpawnPrimary);
        EventHandler.addListener(this, EventHandler.Event.GAMESPAWN_CREATION_TOOL_SECONDARY, this.onGameSpawnSecondary);

        EventHandler.addListener(this, EventHandler.Event.SP_GAMEMENU_SAVE_GAME_REQUEST, this.onSaveGameRequest);
        EventHandler.addListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onSceneUpdate);
        EventHandler.addListener(this, EventHandler.Event.RENDERER_RENDER_PREPARE, this.onBeforeRender);

        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.onPlayerRemoval);
         
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_MOVEMENT_UPDATE, this.onPlayerMove);

    }

    disable(){
        EventHandler.removeListener(this, EventHandler.Event.BLOCK_CREATION_TOOL_PRIMARY, this.onBCTPrimary);
        EventHandler.removeListener(this, EventHandler.Event.BLOCK_CREATION_TOOL_SECONDARY, this.onBCTSecondary);

        EventHandler.removeListener(this, EventHandler.Event.INITIALSPAWN_CREATION_TOOL_PRIMARY, this.onInitialSpawnPrimary);
        EventHandler.removeListener(this, EventHandler.Event.INITIALSPAWN_CREATION_TOOL_SECONDARY, this.onInitialSpawnSecondary);

        EventHandler.removeListener(this, EventHandler.Event.GAMESPAWN_CREATION_TOOL_PRIMARY, this.onGameSpawnPrimary);
        EventHandler.removeListener(this, EventHandler.Event.GAMESPAWN_CREATION_TOOL_SECONDARY, this.onGameSpawnSecondary);

        EventHandler.removeListener(this, EventHandler.Event.SP_GAMEMENU_SAVE_GAME_REQUEST, this.onSaveGameRequest);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onSceneUpdate);
        EventHandler.removeListener(this, EventHandler.Event.RENDERER_RENDER_PREPARE, this.onBeforeRender);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.onPlayerRemoval);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_MOVEMENT_UPDATE, this.onPlayerMove);

        this.clearScene(true);
    }

    onSceneUpdate(data){
        this.title = data.title;
        this.width = data.width + 2;
        this.height = data.height + 2;

        this.clearScene(true);

        this.floor = this.createFloor();
        this.lines = this.createLines();
        this.lights = this.createLights();

        let locations = this.parseLocationData(data.blockLocations);

        this.gameSpawnLocations = this.parseLocationData(data.gameSpawnLocations) || [];
        this.initialSpawnLocations = this.parseLocationData(data.initialSpawnLocations) || [];

        EventHandler.callEvent(EventHandler.Event.ARENA_BLOCKLOCATION_UPDATE, this.blockLocations);
        EventHandler.callEvent(EventHandler.Event.ARENA_INITIALSPAWN_UPDATE, this.initialSpawnLocations);
        EventHandler.callEvent(EventHandler.Event.ARENA_GAMESPAWN_UPDATE, this.gameSpawnLocations);


        this.updateBlocks(locations);
        
        this.scene.add(this.lines);
        this.scene.add(this.floor);
        this.scene.add(this.blocks);
        this.scene.add.apply(this.scene, this.lights);
    }

    onBeforeRender(){
        if(this.blocks && this.floor){
            let raycaster = RaycastHandler.getRaycaster();
            this.blocksIntersection = raycaster.intersectObject(this.blocks);
            this.floorIntersection = raycaster.intersectObject(this.floor);
        }else{
            this.blocksIntersection = [];
            this.floorIntersection = [];
        }
    }

    onSaveGameRequest(){
        let blockData = this.generateLocationData(this.blockLocations);
        let gameSpawnData = this.generateLocationData(this.gameSpawnLocations);
        let initialSpawnData = this.generateLocationData(this.initialSpawnLocations);
        let saveObject = {
            title: this.title,
            width: this.width - 2,
            height: this.height - 2,
            blockLocations: blockData,
            gameSpawnLocations: gameSpawnData,
            initialSpawnLocations: initialSpawnData
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

    onPlayerAddition(player: Player){
        let playerGeo = new Geometry();
        let playerHeadGeo = new Geometry();

        let bodyGeo = new BoxGeometry(this.playerBodyWidth, this.playerBodyHeight, this.playerBodyDepth);
        let headGeo = new BoxGeometry(0.5, 0.35, 0.5);
        let turretGeo = new CylinderGeometry(0.0625, 0.0625, 0.75, 8, 1, true);
        turretGeo.rotateX(Math.PI / 2);


        let bodyMaterial = new MeshLambertMaterial({
            color: 0xce141a
        });

        let headMaterial = new MeshLambertMaterial({
            color: 0xce141a,
            side: DoubleSide
        });

        let headOffset = new Vector3(0, this.playerBodyHeight / 2 + 0.35/2, 0);
        let turretOffset = new Vector3(0, this.playerBodyHeight / 2 + 0.35/2, 0.25); 

        for(let i = 0; i < headGeo.vertices.length; i ++){
            headGeo.vertices[i].add(headOffset);
        }
        for(let i = 0; i < turretGeo.vertices.length; i ++){
            turretGeo.vertices[i].add(turretOffset);
        }

        playerHeadGeo.merge(headGeo);
        playerHeadGeo.merge(turretGeo);

        //playerGeo.merge(playerHeadGeo);
        playerGeo.merge(bodyGeo);

        let bodyMesh = new Mesh(playerGeo, bodyMaterial);
        bodyMesh.position.copy(player.position).add(this.playerOffset);

        let headMesh = new Mesh(playerHeadGeo, headMaterial);
        headMesh.position.copy(player.position).add(this.playerOffset);

        this.scene.add(bodyMesh, headMesh);

        this.players.set(player.id, {
            body: bodyMesh,
            head: headMesh
        });
    }

    onPlayerRemoval(player: Player){
        if(this.players.has(player.id)){
            let obj = this.players.get(player.id);
            this.scene.remove(obj.body);
            this.scene.remove(obj.head)
            this.players.delete(player.id);
        }
    }

    onPlayerMove(data){
        if(this.players.has(data.id)){
            let playerObj = this.players.get(data.id);

            let body = playerObj.body;
            let head = playerObj.head;

            head.position.copy(data.pos).add(this.playerOffset);
            head.rotation.y = data.headRot;

            body.position.copy(data.pos).add(this.playerOffset);
            body.rotation.y = data.bodyRot; 

            //some head rotation
        }
    }

    onBCTPrimary(){
        if(this.floorIntersection.length){
            let location = this.floorIntersection[0].point.setY(0);
            location.floor();
            if(!this.isLocationBlock(location)){
                this.blockLocations.push(location);
                this.updateBlocks(this.blockLocations);
                EventHandler.callEvent(EventHandler.Event.ARENA_BLOCKLOCATION_UPDATE, this.blockLocations);
            }
        }
    }

    onBCTSecondary(){
        if(this.floorIntersection.length){
            let location = this.floorIntersection[0].point.setY(0);
            location.floor();
            let removed = this.removeBlockLocation(location);
            if(removed){
                this.updateBlocks(this.blockLocations);
                EventHandler.callEvent(EventHandler.Event.ARENA_BLOCKLOCATION_UPDATE, this.blockLocations);
            }
        }
    }

    onInitialSpawnPrimary(){
        if(this.floorIntersection.length){
            let location = this.floorIntersection[0].point.setY(0);
            location.floor();
            if(this.isLocationBlock(location)){
                //TODO alert user cannot use location
                console.log('IS is block');
            }else if(this.isLocationInitialSpawn(location)){
                //TODO alert user cannot use location
                console.log('IS is already IS');
            }else{
                this.initialSpawnLocations.push(location);
                //TODO Alert success
                console.log('IS added');
                EventHandler.callEvent(EventHandler.Event.ARENA_INITIALSPAWN_UPDATE, this.initialSpawnLocations);
            }
        }
    }

    onInitialSpawnSecondary(){
        if(this.floorIntersection.length){
            let location = this.floorIntersection[0].point.setY(0);
            location.floor();
            let removed = this.removeInitialSpawnLocation(location);
            if(removed){
                //TODO Alert success
                console.log('IS removed');
                EventHandler.callEvent(EventHandler.Event.ARENA_INITIALSPAWN_UPDATE, this.initialSpawnLocations);
            }else{
                //TODO Alert failure
                console.log('IS not removed');
            }
        }
    }

    onGameSpawnPrimary(){
        if(this.floorIntersection.length){
            let location = this.floorIntersection[0].point.setY(0);
            location.floor();
            if(this.isLocationBlock(location)){
                //TODO alert user cannot use location
                console.log('GS is Block');
            }else if(this.isLocationGameSpawn(location)){
                //TODO alert user cannot use location
                console.log('GS is already GS');
            }else{
                this.gameSpawnLocations.push(location);
                console.log('GS added');
                //TODO Alert success
                EventHandler.callEvent(EventHandler.Event.ARENA_GAMESPAWN_UPDATE, this.gameSpawnLocations);
            }
        }
    }

    onGameSpawnSecondary(){
        if(this.floorIntersection.length){
            let location = this.floorIntersection[0].point.setY(0);
            location.floor();
            let removed = this.removeGameSpawnLocation(location);
            if(removed){
                //TODO Alert success
                console.log('GS removed');
                EventHandler.callEvent(EventHandler.Event.ARENA_GAMESPAWN_UPDATE, this.gameSpawnLocations);
            }else{
                //TODO Alert failure
                console.log('GS not removed');
            }
        }
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

    updateBlocks(locations: Array<Vector3>){
        let blockGeometries = [];
        let masterGeo = new Geometry();
        if(locations){
            for(let i = 0; i < locations.length; i ++){
                let pos = locations[i];
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
            if(locations){
                this.blockLocations = locations;
            }else{
                this.blockLocations = blockGeometries;
            }
        }
    }

    clearScene(removePlayers: boolean){
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
        if(this.blockLocations){
            this.blockLocations = [];
        }
        if(removePlayers){
            let playerValues = this.players.values();
            let playerValue = playerValues.next();
            while(!playerValue.done){
                this.scene.remove(playerValue.value.body);
                playerValue = playerValues.next();
            }
        }
    }

    getScene(){
        return this.scene;
    }

    getCenter(){
        return new Vector3(this.width / 2, 0, this.height / 2);
    }

    isLocationBlock(loc: Vector3){
        return this.isLocationInArray(loc, this.blockLocations);
    }

    isLocationGameSpawn(loc: Vector3){
        return this.isLocationInArray(loc, this.gameSpawnLocations);
    }

    isLocationInitialSpawn(loc: Vector3){
        return this.isLocationInArray(loc, this.initialSpawnLocations);
    }

    removeBlockLocation(loc: Vector3){
        return this.removeLocationFromArray(loc, this.blockLocations);
    }

    removeInitialSpawnLocation(loc: Vector3){
        return this.removeLocationFromArray(loc, this.initialSpawnLocations);
    }

    removeGameSpawnLocation(loc: Vector3){
        return this.removeLocationFromArray(loc, this.gameSpawnLocations);
    }

    removeLocationFromArray(loc: Vector3, arr: Array<Vector3>){
        let spliceIndex = -1;
        for(let i = 0; i < arr.length; i ++){
            if(arr[i].equals(loc)){
                spliceIndex = i;
                break;
            }
        }
        if(spliceIndex > -1){
            arr.splice(spliceIndex, 1);
            return true;
        }
        return false;
    }

    isLocationInArray(loc: Vector3, arr: Array<Vector3>){
        for(let i = 0; i < arr.length; i ++){
            if(arr[i].equals(loc)) return true;
        }
        return false;
    }

    generateLocationData(data){
        let locationCount = data.length;
        let output = [];
        for(let i = 0; i < locationCount; i ++){
            let loc = data[i];
            output.push(loc.x, loc.y, loc.z);
        }
        return output;
    }

    parseLocationData(data){
        if(data){
            let dataCount = data.length;
            if(dataCount % 3 === 0){
                let locations = [];
                for(let i = 0; i < dataCount / 3; i ++){
                    let x = data[i * 3];
                    let y = data[i * 3 + 1];
                    let z = data[i * 3 + 2];
    
                    locations.push(new Vector3(x, y, z));
                }
                return locations;
            }else{
                console.log('Invalid block location data');
            }
        }
    }
}
