import Component from '../Component';
import DomHandler from '../DomHandler';
import EventHandler from '../EventHandler';

export default class ArenaCreateModeToggle extends Component{

    constructor(gui){
        super();
        this.parentElt = DomHandler.getElement('.create-world-mode-toggle-parent', gui);
        this.cameraToggleElt = DomHandler.getElement('#gui-create-world-toggle-camera', this.parentElt);
        this.blockToggleElt = DomHandler.getElement('#gui-create-world-toggle-block', this.parentElt);
        this.gamespawnToggleElt = DomHandler.getElement('#gui-create-world-toggle-gamespawn', this.parentElt);
        this.initialspawnToggleElt = DomHandler.getElement('#gui-create-world-toggle-initialspawn', this.parentElt);

        this.mode = Mode.CAMERA;

    }

    enable = () => {
        EventHandler.addListener(EventHandler.Event.DOM_CLICK, this.onClick);
        EventHandler.addListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_BLOCK, this.onToggleBlock);
        EventHandler.addListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_CAMERA, this.onToggleCamera);
        EventHandler.addListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_GAMESPAWN, this.onToggleGameSpawn);
        EventHandler.addListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_INITIALSPAWN, this.onToggleInitialSpawn);

        EventHandler.addListener(EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);

        this.updateHTMLClasses();
        
        this.parentElt.style.display = 'inline-block';
    };

    disable = () => {
        EventHandler.removeListener(EventHandler.Event.DOM_CLICK, this.onClick);
        EventHandler.removeListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_BLOCK, this.onToggleBlock);
        EventHandler.removeListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_CAMERA, this.onToggleCamera);
        EventHandler.removeListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_GAMESPAWN, this.onToggleGameSpawn);
        EventHandler.removeListener(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_INITIALSPAWN, this.onToggleInitialSpawn);
        EventHandler.removeListener(EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);


        this.parentElt.style.display = 'none';
    };

    onClick = (event) => {
        if(event.target === this.cameraToggleElt){
            if(!this.mode !== Mode.CAMERA){
                EventHandler.callEvent(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_CAMERA);
            }
        }else if(event.target === this.blockToggleElt){
            if(!this.mode !== Mode.BLOCK){
                EventHandler.callEvent(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_BLOCK);
            }
        }else if(event.target === this.gamespawnToggleElt){
            if(!this.mode !== Mode.GAMESPAWN){
                EventHandler.callEvent(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_GAMESPAWN);
            }
        }else if(event.target === this.initialspawnToggleElt){
            if(!this.mode !== Mode.INITIALSPAWN){
                EventHandler.callEvent(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_INITIALSPAWN);
            }
        }
    };

    onKeyDown = (event) => {
        if(event.code === 'KeyB'){
            if(!this.mode !== Mode.BLOCK){
                EventHandler.callEvent(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_BLOCK);
            }
        }else if(event.code === 'KeyC'){
            if(this.mode !== Mode.CAMERA){
                EventHandler.callEvent(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_CAMERA)
            }
        }
    };

    onToggleCamera = () => {
        this.mode = Mode.CAMERA;
        this.updateHTMLClasses();
    };

    onToggleBlock = () => {
        this.mode = Mode.BLOCK;
        this.updateHTMLClasses();
    }

    onToggleGameSpawn = () => {
        this.mode = Mode.GAMESPAWN;
        this.updateHTMLClasses();
    };

    onToggleInitialSpawn = () => {
        this.mode = Mode.INITIALSPAWN;
        this.updateHTMLClasses();
    };

    updateHTMLClasses = () => {
        switch(this.mode){
            case Mode.CAMERA:
                this.cameraToggleElt.classList.add('create-world-toggle-enabled');

                this.blockToggleElt.classList.remove('create-world-toggle-enabled');
                this.gamespawnToggleElt.classList.remove('create-world-toggle-enabled');
                this.initialspawnToggleElt.classList.remove('create-world-toggle-enabled');
                break;
            case Mode.BLOCK:
                this.blockToggleElt.classList.add('create-world-toggle-enabled');

                this.cameraToggleElt.classList.remove('create-world-toggle-enabled');
                this.gamespawnToggleElt.classList.remove('create-world-toggle-enabled');
                this.initialspawnToggleElt.classList.remove('create-world-toggle-enabled');
                break;
            case Mode.GAMESPAWN:
                this.gamespawnToggleElt.classList.add('create-world-toggle-enabled');

                this.cameraToggleElt.classList.remove('create-world-toggle-enabled');
                this.blockToggleElt.classList.remove('create-world-toggle-enabled');
                this.initialspawnToggleElt.classList.remove('create-world-toggle-enabled');
                break;
            case Mode.INITIALSPAWN:
                this.initialspawnToggleElt.classList.add('create-world-toggle-enabled');

                this.cameraToggleElt.classList.remove('create-world-toggle-enabled');
                this.gamespawnToggleElt.classList.remove('create-world-toggle-enabled');
                this.blockToggleElt.classList.remove('create-world-toggle-enabled');
                break;
        }
    };
}

const Mode = {
    CAMERA: 0,
    BLOCK: 1,
    GAMESPAWN: 2,
    INITIALSPAWN: 3
}
