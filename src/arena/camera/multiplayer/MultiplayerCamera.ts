import Component from '../../../component/ChildComponent';
import EventHandler from '../../../EventHandler';
import DomHandler from '../../../DomHandler';

import {Spherical, PerspectiveCamera} from 'three';
import CameraControls from '../CameraControls';

export default class Camera extends Component{

    camera: PerspectiveCamera;
    controls: CameraControls;

    gameMenuOpen: boolean;
    
    constructor(camera: PerspectiveCamera){
        super();
        this.camera = camera;

        this.controls = new CameraControls(camera, true, false);

        this.gameMenuOpen = false;
    }

    enable(){
        EventHandler.addListener(this, EventHandler.Event.DOM_RESIZE, this.onResize, EventHandler.Level.LOW);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);

        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_MOVE, this.onPlayerMove);

        this.attachControls();
    }

    disable(){
        EventHandler.removeListener(this, EventHandler.Event.DOM_RESIZE, this.onResize, EventHandler.Level.LOW);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_MOVE, this.onPlayerMove);

        this.detachControls();

        this.gameMenuOpen = false;
    }

    onPlayerAddition(data){
        if(!this.gameMenuOpen){
            this.detachControls();
        }

        this.controls = new CameraControls(this.camera, true, false);
        this.controls.target = data.pos.clone().addScalar(0.5).setY(0);
        this.controls.spherical = new Spherical(25, 5 * Math.PI / 16, Math.PI);
        this.controls.update();

        if(!this.gameMenuOpen){
            this.attachControls();
        }
    }

    onPlayerRemoval(){
        if(!this.gameMenuOpen){
            this.detachControls();
        }

        let target = this.controls.target; 
        let spherical = this.controls.spherical;

        this.controls = new CameraControls(this.camera, false, false);

        this.controls.target = target;
        this.controls.spherical = spherical;
        this.controls.update();

        if(!this.gameMenuOpen){
            this.attachControls();
        }

    }

    onPlayerMove(data){
        this.controls.target = data.pos.clone().addScalar(0.5).setY(0);
        this.controls.spherical.theta = data.bodyRot + Math.PI;
        this.controls.update();
    }

    onResize(){
        let dimensions = DomHandler.getDisplayDimensions();
        this.camera.aspect = dimensions.width / dimensions.height;
        this.camera.updateProjectionMatrix();
    }

    onGameMenuOpen(){
        this.gameMenuOpen = true;
        this.detachControls();
    }

    onGameMenuClose(){
        this.gameMenuOpen = false;
        this.attachControls();
    }

    attachControls(){
        this.attachChild(this.controls);
    }

    detachControls(){
        this.detachChild(this.controls);
    }
}
