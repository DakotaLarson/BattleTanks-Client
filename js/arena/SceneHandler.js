import {Scene, Color, PlaneGeometry, Mesh, MeshLambertMaterial, HemisphereLight, HemisphereLightHelper, DirectionalLight, DirectionalLightHelper, CameraHelper, Vector3, BufferGeometry, Float32BufferAttribute, LineSegments, LineDashedMaterial, BoxGeometry, Geometry} from 'three';

import Component from 'Component';
import BlockCreationTool from 'BlockCreationTool';
import EventHandler from 'EventHandler';



export default class SceneHandler extends Component{

    constructor(worldData){
        super();
        this.title = worldData.title;
        this.width = worldData.width + 2;
        this.height = worldData.height + 2;
        this.scene = new Scene();
        this.scene.background = new Color(0x1e1e20);
        this.blockLocations = [];
        this.floor = this.createFloor();
        this.lines = this.createLines();
        this.lights = this.createLights();
        this.blocks = null;
        this.updateBlocks(worldData.blockLocations, true);

    }

    enable = () => {

        EventHandler.addListener(EventHandler.Event.BLOCK_CREATION_TOOL_PRIMARY, this.handleBCTPrimary);
        EventHandler.addListener(EventHandler.Event.BLOCK_CREATION_TOOL_SECONDARY, this.handleBCTSecondary);
        EventHandler.addListener(EventHandler.Event.GAMEMENU_SAVE_GAME_REQUEST, this.onSaveGameRequest);

        for(let i = 0; i < this.lights.length; i ++){
            this.scene.add(this.lights[i]);
        }
        this.scene.add(this.lines);
        this.scene.add(this.floor);
        this.scene.add(this.blocks);
    };

    disable = () => {
        EventHandler.removeListener(EventHandler.Event.BLOCK_CREATION_TOOL_PRIMARY, this.handleBCTPrimary);
        EventHandler.removeListener(EventHandler.Event.BLOCK_CREATION_TOOL_SECONDARY, this.handleBCTSecondary);
        EventHandler.removeListener(EventHandler.Event.GAMEMENU_SAVE_GAME_REQUEST, this.onSaveGameRequest);

        for(let i = 0; i < this.lights.length; i ++){
            this.scene.remove(this.lights[i]);
        }
        this.scene.remove(this.lines);
        this.scene.remove(this.floor);
        this.scene.remove(this.blocks);
    };

    getScene = () => {
        return this.scene;
    };

    getCenter = () => {
        return new Vector3(this.width / 2, 0, this.height / 2);
    };

    handleBCTPrimary = (location) => {
        location.floor();
        let locationString = location.x + ' ' + location.y + ' ' + location.z;
        if(this.blockLocations.indexOf(locationString) === -1){
            this.blockLocations.push(locationString);
            this.updateBlocks(this.blockLocations, false);
        }

    };

    handleBCTSecondary = (location) => {
        location.floor();
        let locationString = location.x + ' ' + location.y + ' ' + location.z;
        let index = this.blockLocations.indexOf(locationString);
        if(index > -1){
            this.blockLocations.splice(index, 1);
            this.updateBlocks(this.blockLocations, false);
        }
    };

    onSaveGameRequest = () => {
        let saveObject = {
            title: this.title,
            width: this.width - 2,
            height: this.height - 2,
            blockLocations: this.blockLocations
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

        dirLight.castShadow = true;
        let shadowRadius = 50;

        dirLight.shadow.camera.left = -shadowRadius;
        dirLight.shadow.camera.right = shadowRadius;
        dirLight.shadow.camera.top = shadowRadius;
        dirLight.shadow.camera.bottom = -shadowRadius;
        dirLight.shadow.camera.far = 150;

        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;

        // let hemiLightHelper = new HemisphereLightHelper( hemiLight);
        // this.scene.add( hemiLightHelper );
        // let dirLightHelper = new DirectionalLightHelper( dirLight );
        // this.scene.add( dirLightHelper );
        // let helper = new CameraHelper(dirLight.shadow.camera);
        // this.scene.add(helper);
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

    updateBlocks = (locStrings, createMesh) => {
        let blocks = [];
        let masterGeo = new Geometry();
        if(locStrings){
            for(let i = 0; i < locStrings.length; i ++){
                let args = locStrings[i].split(' ');
                let pos = new Vector3(
                    Number(args[0]),
                    Number(args[1]),
                    Number(args[2])
                );
                let geo = new BoxGeometry();
                for(let i = 0; i < geo.vertices.length; i ++){
                    geo.vertices[i].add(pos);
                }
                blocks.push(locStrings[i]);
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
                blocks.push(pos.x + ' ' + pos.y + ' ' + pos.z);
                masterGeo.merge(geo);

                geo = new BoxGeometry();
                pos.set(0, 0, i);
                for(let i = 0; i < geo.vertices.length; i ++){
                    geo.vertices[i].add(pos);
                }
                blocks.push(pos.x + ' ' + pos.y + ' ' + pos.z);
                masterGeo.merge(geo);
            }

            for(let i = 1; i < this.width - 1; i ++){
                let geo = new BoxGeometry();
                let pos = new Vector3(i, 0, this.height - 1);
                for(let i = 0; i < geo.vertices.length; i ++){
                    geo.vertices[i].add(pos);
                }
                blocks.push(pos.x + ' ' + pos.y + ' ' + pos.z);
                masterGeo.merge(geo);

                geo = new BoxGeometry();
                pos.set(i, 0, 0);
                for(let i = 0; i < geo.vertices.length; i ++){
                    geo.vertices[i].add(pos);
                }
                blocks.push(pos.x + ' ' + pos.y + ' ' + pos.z);
                masterGeo.merge(geo);
            }
        }
        let material = new MeshLambertMaterial({color: 0x0077ef});
        masterGeo.mergeVertices();
        if(createMesh){
            this.blocks = new Mesh(masterGeo, material);
            this.blocks.position.addScalar(0.5);
            this.blockLocations = blocks;
        }else{
            this.blocks.geometry = masterGeo;
            this.blocks.needsUpdate = true;
        }
    };
}
