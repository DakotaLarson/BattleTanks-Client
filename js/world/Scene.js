import {Scene as Three_Scene, Color, PlaneGeometry, Mesh, MeshLambertMaterial, HemisphereLight, HemisphereLightHelper, DirectionalLight, DirectionalLightHelper, CameraHelper, Vector3, BufferGeometry, Float32BufferAttribute, LineSegments, LineDashedMaterial} from 'three';

import Component from 'Component';
import Block from 'Block';
import BlockCreationTool from 'BlockCreationTool';
import EventHandler from "../EventHandler";



export default class Scene extends Component{

    constructor(camera){
        super();
        this.width = 50;
        this.height = 30;
        this.scene = new Three_Scene();
        this.scene.background = new Color(0x1e1e20);
        this.blockLocations = {};
        this.floor = this.createFloor();
        this.lines = this.createLines();
        this.lights = this.createLights();
        this.blockCreationTool = new BlockCreationTool(camera, this.floor);
        this.state.bctEnabled = false;
    }

    enable = () => {
        EventHandler.addEventListener(EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.addEventListener(EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.onGameMenuClose);
        EventHandler.addEventListener(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_BLOCK, this.handleToggleToBlock);
        EventHandler.addEventListener(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_CAMERA, this.handleToggleToCamera);
        EventHandler.addEventListener(EventHandler.Event.BLOCK_CREATION_TOOL_PRIMARY, this.handleBCTPrimary);
        EventHandler.addEventListener(EventHandler.Event.BLOCK_CREATION_TOOL_SECONDARY, this.handleBCTSecondary);

        for(let i = 0; i < this.lights.length; i ++){
            this.scene.add(this.lights[i]);
        }
        this.scene.add(this.lines);
        this.scene.add(this.floor);
        this.createWall();
    };

    disable = () => {
        EventHandler.removeEventListener(EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.removeEventListener(EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.onGameMenuClose);
        EventHandler.removeEventListener(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_BLOCK, this.handleToggleToBlock);
        EventHandler.removeEventListener(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_CAMERA, this.handleToggleToCamera);
        EventHandler.removeEventListener(EventHandler.Event.BLOCK_CREATION_TOOL_PRIMARY, this.handleBCTPrimary);
        EventHandler.removeEventListener(EventHandler.Event.BLOCK_CREATION_TOOL_SECONDARY, this.handleBCTSecondary);

        for(let i = 0; i < this.lights.length; i ++){
            this.scene.remove(this.lights[i]);
        }
        this.scene.remove(this.lines);
        this.scene.remove(this.floor);
    };

    onGameMenuOpen = () => {
        if(this.state.bctEnabled){
            this.detachChild(this.blockCreationTool);
        }
    };

    onGameMenuClose = () => {
        if(this.state.bctEnabled){
            this.attachChild(this.blockCreationTool);
        }
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
        if(!(locationString in this.blockLocations)){
            let block = new Block(location, 0x0077ef, this.scene);
            this.attachChild(block);
            console.log(locationString);
            this.blockLocations[locationString] = block;
        }

    };

    handleBCTSecondary = (location) => {
        location.floor();
        let locationString = location.x + ' ' + location.y + ' ' + location.z;
        if(locationString in this.blockLocations){
            let block = this.blockLocations[locationString];
            this.detachChild(block);
            delete this.blockLocations[locationString];
        }
    };

    handleToggleToCamera = () => {
        this.detachChild(this.blockCreationTool);
        this.state.bctEnabled = false;
    };

    handleToggleToBlock = () => {
        this.attachChild(this.blockCreationTool);
        this.state.bctEnabled = true;
    };

    createWall = () => {
        let block = new Block(this.getCenter(), 0x0077ef, this.scene);
        this.attachChild(block);

        for(let i = 0; i < this.height; i ++){
            let block = new Block(new Vector3(this.width - 1, 0, i), 0x0077ef, this.scene);
            this.attachChild(block);

            block = new Block(new Vector3(0, 0, i), 0x0077ef, this.scene);
            this.attachChild(block);
        }

        for(let i = 1; i < this.width - 1; i ++){
            let block = new Block(new Vector3(i, 0, this.height - 1), 0x0077ef, this.scene);
            this.attachChild(block);

            block = new Block(new Vector3(i, 0, 0), 0x0077ef, this.scene);
            this.attachChild(block);
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
}
