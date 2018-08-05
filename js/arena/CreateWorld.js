import {PerspectiveCamera} from 'three';

import Component from 'Component';
import Renderer from 'Renderer';
import Scene from 'Scene';
import GUI from 'GUI';
import EventHandler from 'EventHandler';
import GameMenu from 'GameMenu';
import Camera from 'Camera';

export default class CreateWorld extends Component{

    constructor(worldData){
        super();
        let perspectiveCamera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.scene = new Scene(perspectiveCamera, worldData);
        this.camera = new Camera(perspectiveCamera, this.scene);
        this.renderer = new Renderer(this.scene.getScene(), this.camera.getCamera());
        this.gui = new GUI();
        this.gameMenu = new GameMenu();

        this.state.gameMenuEnabled = false;
        this.state.switchToCamera = false;

    }

    enable = () => {
        EventHandler.addListener(EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.addListener(EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.closeGameMenu);
        EventHandler.addListener(EventHandler.Event.DOM_BLUR, this.onBlur);
        EventHandler.addListener(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_BLOCK, this.handleToggleToBlock);
        EventHandler.addListener(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_CAMERA, this.handleToggleToCamera);

        this.attachChild(this.scene);
        this.attachChild(this.renderer);
        this.attachChild(this.camera);
        this.attachChild(this.gui);

    };

    disable = () => {
        EventHandler.removeListener(EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.removeListener(EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.closeGameMenu);
        EventHandler.removeListener(EventHandler.Event.DOM_BLUR, this.onBlur);
        EventHandler.removeListener(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_BLOCK, this.handleToggleToBlock);
        EventHandler.removeListener(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_CAMERA, this.handleToggleToCamera);

        this.detachChild(this.scene);
        this.detachChild(this.renderer);
        this.detachChild(this.camera);
        this.detachChild(this.gui);
    };

    onKeyDown = (event) => {
        if(event.code === 'Escape') {
            if(this.state.gameMenuEnabled){
                EventHandler.callEvent(EventHandler.Event.GAMEMENU_CLOSE_REQUEST);
            }else{
                this.openGameMenu();
            }
        }else if(event.code === 'KeyB'){
            if(!this.state.switchToCamera){
                EventHandler.callEvent(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_BLOCK);
            }
        }else if(event.code === 'KeyC'){
            if(this.state.switchToCamera){
                EventHandler.callEvent(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_CAMERA)
            }
        }
    };

    onBlur = () => {
        if(!this.state.gameMenuEnabled){
            this.openGameMenu();
        }
    };

    closeGameMenu = () => {
        this.detachChild(this.gameMenu);
        this.state.gameMenuEnabled = false;
    };

    openGameMenu = () => {
        this.attachChild(this.gameMenu);
        this.state.gameMenuEnabled = true;
    };

    handleToggleToCamera = () => {
        this.state.switchToCamera = false;
    };

    handleToggleToBlock = () => {
        this.state.switchToCamera = true;
    }
}
