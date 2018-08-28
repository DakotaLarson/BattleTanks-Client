import {Scene, Color, PlaneGeometry, Mesh, MeshLambertMaterial, HemisphereLight, DirectionalLight, Vector3, BufferGeometry, Float32BufferAttribute, LineSegments, LineDashedMaterial, BoxGeometry, Geometry, Raycaster, Vector2} from 'three';

import Component from '../Component';
import EventHandler from '../EventHandler';
import DomHandler from '../DomHandler';



export default class SceneHandler extends Component{

    constructor(camera){
        super();

        this.title = undefined;
        this.width = undefined;
        this.height = undefined;

        this.blockLocations = [];
        this.initialSpawnLocations = [];
        this.gameSpawnLocations = [];

        this.floor = undefined;
        this.lines = undefined;
        this.lights = undefined;
        this.blocks = undefined;

        this.scene = new Scene();
        this.scene.background = new Color(0x1e1e20);

        this.camera = camera;

        this.raycaster = new Raycaster();
        this.mouseCoords = new Vector2();

        this.blocksIntersection = [];
        this.floorIntersection = [];
    }

    enable = () => {
        EventHandler.addListener(EventHandler.Event.BLOCK_CREATION_TOOL_PRIMARY, this.onBCTPrimary);
        EventHandler.addListener(EventHandler.Event.BLOCK_CREATION_TOOL_SECONDARY, this.onBCTSecondary);

        EventHandler.addListener(EventHandler.Event.INITIALSPAWN_CREATION_TOOL_PRIMARY, this.onInitialSpawnPrimary);
        EventHandler.addListener(EventHandler.Event.INITIALSPAWN_CREATION_TOOL_SECONDARY, this.onInitialSpawnSecondary);

        EventHandler.addListener(EventHandler.Event.GAMESPAWN_CREATION_TOOL_PRIMARY, this.onGameSpawnPrimary);
        EventHandler.addListener(EventHandler.Event.GAMESPAWN_CREATION_TOOL_SECONDARY, this.onGameSpawnSecondary);

        EventHandler.addListener(EventHandler.Event.SP_GAMEMENU_SAVE_GAME_REQUEST, this.onSaveGameRequest);
        EventHandler.addListener(EventHandler.Event.ARENA_SCENE_UPDATE, this.handleSceneUpdate);
        EventHandler.addListener(EventHandler.Event.RENDERER_RENDER_PREPARE, this.onBeforeRender);

    };

    disable = () => {
        EventHandler.removeListener(EventHandler.Event.BLOCK_CREATION_TOOL_PRIMARY, this.onBCTPrimary);
        EventHandler.removeListener(EventHandler.Event.BLOCK_CREATION_TOOL_SECONDARY, this.onBCTSecondary);

        EventHandler.removeListener(EventHandler.Event.INITIALSPAWN_CREATION_TOOL_PRIMARY, this.onInitialSpawnPrimary);
        EventHandler.removeListener(EventHandler.Event.INITIALSPAWN_CREATION_TOOL_SECONDARY, this.onInitialSpawnSecondary);

        EventHandler.removeListener(EventHandler.Event.GAMESPAWN_CREATION_TOOL_PRIMARY, this.onGameSpawnPrimary);
        EventHandler.removeListener(EventHandler.Event.GAMESPAWN_CREATION_TOOL_SECONDARY, this.onGameSpawnSecondary);

        EventHandler.removeListener(EventHandler.Event.SP_GAMEMENU_SAVE_GAME_REQUEST, this.onSaveGameRequest);
        EventHandler.removeListener(EventHandler.Event.ARENA_SCENE_UPDATE, this.handleSceneUpdate);
        EventHandler.removeListener(EventHandler.Event.RENDERER_RENDER_PREPARE, this.onBeforeRender);

        this.clearScene();
    };

    handleSceneUpdate = (data) => {
        this.title = data.title;
        this.width = data.width + 2;
        this.height = data.height + 2;

        this.clearScene();

        this.floor = this.createFloor();
        this.lines = this.createLines();
        this.lights = this.createLights();

        let locations = this.parseLocationData(data.blockLocations);

        this.gameSpawnLocations = this.parseLocationData(data.gameSpawnLocations) || [];
        this.initialSpawnLocations = this.parseLocationData(data.initialSpawnLocations) || [];

        this.updateBlocks(locations);
        
        this.scene.add(this.lines);
        this.scene.add(this.floor);
        this.scene.add(this.blocks);
        this.scene.add.apply(this.scene, this.lights);
    };

    onBeforeRender = () => {
        if(this.blocks && this.floor){
            this.updateMouseCoords();
            this.raycaster.setFromCamera(this.mouseCoords, this.camera);
            this.blocksIntersection = this.raycaster.intersectObject(this.blocks);
            this.floorIntersection = this.raycaster.intersectObject(this.floor);
        }else{
            this.blocksIntersection = [];
            this.floorIntersection = [];
        }
    };

    onSaveGameRequest = () => {
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
    };

    onBCTPrimary = () => {
        if(this.floorIntersection.length){
            let location = this.floorIntersection[0].point.setY(0);
            location.floor();
            if(!this.isLocationBlock(location)){
                this.blockLocations.push(location);
                this.updateBlocks(this.blockLocations);
            }
        }
    };

    onBCTSecondary = () => {
        if(this.floorIntersection.length){
            let location = this.floorIntersection[0].point.setY(0);
            location.floor();
            let removed = this.removeBlockLocation(location);
            if(removed){
                this.updateBlocks(this.blockLocations);
            }
        }
    };

    onInitialSpawnPrimary = () => {
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
            }
        }
    };

    onInitialSpawnSecondary = () => {
        if(this.floorIntersection.length){
            let location = this.floorIntersection[0].point.setY(0);
            location.floor();
            let removed = this.removeInitialSpawnLocation(location);
            if(removed){
                //TODO Alert success
                console.log('IS removed');
            }else{
                //TODO Alert failure
                console.log('IS not removed');
            }
        }
    };

    onGameSpawnPrimary = () => {
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
            }
        }
    };

    onGameSpawnSecondary = () => {
        if(this.floorIntersection.length){
            let location = this.floorIntersection[0].point.setY(0);
            location.floor();
            let removed = this.removeGameSpawnLocation(location);
            if(removed){
                //TODO Alert success
                console.log('GS removed');
            }else{
                //TODO Alert failure
                console.log('GS not removed');
            }
        }
    };

    createLines = () => {
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
        let lineSegments = new LineSegments(geo, new LineDashedMaterial({
            color: 0x000000,
            dashSize: 0.375,
            gapSize: 0.125
        }));
        lineSegments.computeLineDistances();
        return lineSegments;
    };

    createLights = () => {
        let hemiLight = new HemisphereLight( 0xffffff, 0xffffff, 0.6 );
        hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        hemiLight.position.copy(this.getCenter().setY(50));

        let dirLight = new DirectionalLight( 0xffffff, 1 );
        dirLight.color.setHSL( 0.1, 1, 0.95 );
        dirLight.position.set(45, 30, 25);
        dirLight.target.position.copy(this.getCenter());
        return [dirLight, dirLight.target, hemiLight];
    };

    createFloor = () => {
        let geometry = new PlaneGeometry(this.width, this.height);
        let material = new MeshLambertMaterial({color:0x2e3334});
        let floor = new Mesh(geometry, material);
        floor.rotation.x -= Math.PI / 2;
        floor.position.copy(this.getCenter());
        floor.receiveShadow = true;
        return floor;
    };

    updateBlocks = (locations) => {
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
            this.blocks.needsUpdate = true;
            
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
    };

    clearScene = () => {
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
    };

    updateMouseCoords = () => {
        let dimensions = DomHandler.getDisplayDimensions();
        let mouseCoords = DomHandler.getMouseCoordinates();
        this.mouseCoords.x = (mouseCoords.x / dimensions.width) * 2 - 1;
        this.mouseCoords.y = -(mouseCoords.y / dimensions.height) * 2 + 1;
    };

    getScene = () => {
        return this.scene;
    };

    getCenter = () => {
        return new Vector3(this.width / 2, 0, this.height / 2);
    };

    isLocationBlock = (loc) => {
        for(let i = 0; i < this.blockLocations.length; i ++){
            if(this.blockLocations[i].equals(loc)) return true;
        }
        return false;
    };

    isLocationGameSpawn = (loc) => {
        for(let i = 0; i < this.gameSpawnLocations.length; i ++){
            if(this.gameSpawnLocations[i].equals(loc)) return true;
        }
        return false;
    };

    isLocationInitialSpawn = (loc) => {
        for(let i = 0; i < this.initialSpawnLocations.length; i ++){
            if(this.initialSpawnLocations[i].equals(loc)) return true;
        }
        return false;
    };

    removeBlockLocation = (loc) => {
        return this.removeLocation(loc, this.blockLocations);
    };

    removeInitialSpawnLocation = (loc) => {
        return this.removeLocation(loc, this.initialSpawnLocations);
    };

    removeGameSpawnLocation = (loc) => {
        return this.removeLocation(loc, this.gameSpawnLocations);
    };

    removeLocation(loc, arr){
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

    generateLocationData = (data) => {
        let locationCount = data.length;
        let output = [];
        for(let i = 0; i < locationCount; i ++){
            let loc = data[i];
            output.push(loc.x, loc.y, loc.z);
        }
        return output;
    }
    parseLocationData = (data) => {
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
