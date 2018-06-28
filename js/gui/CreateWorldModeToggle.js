import Component from 'Component';
import DomHandler from 'DomHandler';
import EventHandler from 'EventHandler';

export default class CreateWorldModeToggle extends Component{

    constructor(parent){
        super();
        this.element = DomHandler.getElement('.create-world-mode-toggle', parent);
        this.switchToCamera = false;

    }

    enable = () => {
        EventHandler.addListener(EventHandler.Event.DOM_CLICK, this.onClick);
        EventHandler.addListener(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_BLOCK, this.onSwitchToBlock);
        EventHandler.addListener(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_CAMERA, this.onSwitchToCamera);

        if(this.switchToCamera){
            this.element.textContent = 'Switch to Camera (C)';
            this.element.classList.add('toggle-to-camera');
        }else{
            this.element.textContent = 'Switch to Block (B)';
            this.element.classList.remove('toggle-to-camera');
        }
        this.element.style.display = 'inline-block';
    };

    disable = () => {
        EventHandler.removeListener(EventHandler.Event.DOM_CLICK, this.onClick);
        EventHandler.removeListener(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_BLOCK, this.onSwitchToBlock);
        EventHandler.removeListener(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_CAMERA, this.onSwitchToCamera);

        this.element.style.display = 'none';
    };

    onClick = (event) => {
        if(event.target === this.element){
            if(this.switchToCamera){
                EventHandler.callEvent(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_CAMERA);
            }else{
                EventHandler.callEvent(EventHandler.Event.CREATE_WORLD_MODE_TOGGLE_BLOCK);
            }
        }
    };

    onSwitchToCamera = () => {
        this.switchToCamera = false;
        this.element.textContent = 'Switch to Block (B)';
        this.element.classList.remove('toggle-to-camera');
    };

    onSwitchToBlock = () => {
        this.switchToCamera = true;
        this.element.textContent = 'Switch to Camera (C)';
        this.element.classList.add('toggle-to-camera');
    }
}
