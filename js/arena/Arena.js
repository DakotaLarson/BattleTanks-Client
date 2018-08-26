import {PerspectiveCamera} from 'three';

import Component from '../Component';
import Renderer from '../Renderer';
import SceneHandler from './SceneHandler';
import EventHandler from '../EventHandler';
import Camera from './camera/Camera';

export default class Arena extends Component{

    constructor(){
        super();
        let perspectiveCamera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera = new Camera(perspectiveCamera);
        this.sceneHandler = new SceneHandler(perspectiveCamera);
        this.renderer = new Renderer(this.sceneHandler.getScene(), this.camera.getCamera());
        

    }

    enable = () => {
        this.attachChild(this.sceneHandler);
        this.attachChild(this.renderer);
        this.attachChild(this.camera);
        

    };

    disable = () => {
        EventHandler.removeListener(EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);
        EventHandler.removeListener(EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.closeGameMenu);
        EventHandler.removeListener(EventHandler.Event.DOM_BLUR, this.onBlur);
        EventHandler.removeListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_BLOCK, this.handleToggleToBlock);
        EventHandler.removeListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_CAMERA, this.handleToggleToCamera);

        this.detachChild(this.sceneHandler);
        this.detachChild(this.renderer);
        this.detachChild(this.camera);
    };

    
}
