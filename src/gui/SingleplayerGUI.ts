import Component from '../Component';
import DomHandler from '../DomHandler';
import DebugPanel from './DebugPanel';
import ArenaCreateModeToggle from './ArenaCreateModeToggle';

export default class GUI extends Component {

    element: HTMLElement;
    debugPanel: DebugPanel;
    createWorldModeToggle: ArenaCreateModeToggle;
    
    constructor(){
        super();
        this.element = DomHandler.getElement('.gui');
        this.debugPanel = new DebugPanel(this.element);
        this.createWorldModeToggle = new ArenaCreateModeToggle(this.element);
    }

    enable(){
        this.attachChild(this.debugPanel);
        this.attachChild(this.createWorldModeToggle);

        this.element.style.display = 'block';
    }

    disable(){
        this.detachChild(this.debugPanel);
        this.detachChild(this.createWorldModeToggle);

        this.element.style.display = '';
    }
}
