import Component from '../component/ChildComponent';
import DomHandler from '../DomHandler';
import DebugPanel from './DebugPanel';
import CooldownBar from './CooldownBar';
import EventHandler from '../EventHandler';

export default class GUI extends Component {

    element: HTMLElement;
    debugPanel: DebugPanel;
    cooldownBar: CooldownBar;
    
    constructor(){
        super();
        this.element = DomHandler.getElement('.gui');

        this.debugPanel = new DebugPanel(this.element);
    }

    enable(){
        EventHandler.addListener(this, EventHandler.Event.COOLDOWN_TIME_RECEPTION, this.onCooldownTimeReception);
        EventHandler.addListener(this, EventHandler.Event.GAME_STATUS_FINISHING, this.onFinish);

        this.attachChild(this.debugPanel);

        this.element.style.display = 'block';
    }

    disable(){
        EventHandler.removeListener(this, EventHandler.Event.COOLDOWN_TIME_RECEPTION, this.onCooldownTimeReception);
        EventHandler.removeListener(this, EventHandler.Event.GAME_STATUS_FINISHING, this.onFinish);

        this.detachChild(this.debugPanel);

        this.element.style.display = '';
    }

    onCooldownTimeReception(time: number){
        this.cooldownBar = new CooldownBar(this.element, time);
        this.attachChild(this.cooldownBar);
    }

    onFinish(){
        this.detachChild(this.cooldownBar);
        this.cooldownBar = undefined;
    }
}
