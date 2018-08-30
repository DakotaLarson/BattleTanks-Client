import Component from '../../../Component';
import EventHandler from '../../../EventHandler';
import DomHandler from '../../../DomHandler';
import MultiplayerControls from './MultiplayerControls';

import {Vector3, Spherical} from 'three';

export default class Camera extends Component{

    constructor(camera){
        super();
        this.camera = camera;

        this.controls = new MultiplayerControls(camera);
    }

    enable(){
        EventHandler.addListener(this, EventHandler.Event.DOM_RESIZE, this.onResize, EventHandler.Level.LOW);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.onGameMenuClose);

        EventHandler.addListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onArenaSceneUpdate);


        this.attachControls();
    }

    disable(){
        EventHandler.removeListener(this, EventHandler.Event.DOM_RESIZE, this.onResize, EventHandler.Level.LOW);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.onGameMenuClose);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_SCENE_UPDATE, this.onArenaSceneUpdate);
        console.log('camera removed');

        this.detachControls();
    }

    onResize(){
        let dimensions = DomHandler.getDisplayDimensions();
        this.camera.aspect = dimensions.width / dimensions.height;
        this.camera.updateProjectionMatrix();
    }

    onGameMenuOpen(){
        this.detachControls();
    }

    onGameMenuClose(){
        this.attachControls();
    }

    attachControls(){
        this.attachChild(this.controls);
    }

    detachControls(){
        this.detachChild(this.controls);
    }

    onArenaSceneUpdate(data){
        console.log('camera location update')
        this.controls.target = new Vector3(data.width / 2, 0, data.height / 2);
        this.controls.spherical = new Spherical(25, Math.PI / 4, Math.PI / 3);
        this.controls.update();
    }
}
