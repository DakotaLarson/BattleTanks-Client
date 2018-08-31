import Component from '../../../Component';
import EventHandler from '../../../EventHandler';
import DomHandler from '../../../DomHandler';
import MultiplayerControls from './MultiplayerControls';

import {Spherical} from 'three';

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

        EventHandler.addListener(this, EventHandler.Event.ARENA_INITIALSPAWN_ASSIGNMENT, this.onArenaSceneUpdate);

        this.attachControls();
    }

    disable(){
        EventHandler.removeListener(this, EventHandler.Event.DOM_RESIZE, this.onResize, EventHandler.Level.LOW);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_CLOSE_REQUEST, this.onGameMenuClose);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_INITIALSPAWN_ASSIGNMENT, this.onArenaSceneUpdate);

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

    onArenaSceneUpdate(loc){
        this.controls.target = loc.clone().addScalar(0.5).setY(0);
        this.controls.spherical = new Spherical(25, Math.PI / 4, Math.PI);
        this.controls.update();
    }
}
